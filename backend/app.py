from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from apscheduler.schedulers.background import BackgroundScheduler

from resume_parser import extract_resume_text
from jd_parser import clean_job_description
from LLMHandler import analyze_with_llm, get_embedding

from job_fetcher import fetch_jobs
from job_classifier import classify_seniority, extract_skills
from job_store import upsert_job, get_jobs, get_jobs_with_embeddings, ensure_indexes, db
from match_score import score_jobs_for_resume
from tracker_store import (
    upsert_tracker_entry, get_tracked_jobs, get_tracker_counts,
    remove_tracker_entry, ensure_tracker_indexes,
    update_notes, set_interview_details, set_follow_up_date,
)
from interview_engine import (
    create_session, get_session, get_next_question,
    add_user_answer, generate_report, ensure_interview_indexes,
    transcribe_audio,
)
from assistant_engine import get_guide_status, chat_with_assistant

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf', 'docx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    print("[INFO] : Recieved /upload_resume request")
    try:
        file = request.files.get('resume')
        if not file or file.filename == '':
            return jsonify({'error': 'No resume file uploaded'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF  OR DOCX files are allowed'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        resume_text = extract_resume_text(filepath)
        if os.path.exists(filepath):
            os.remove(filepath)
        if not resume_text:
            return jsonify({'error': 'Failed to extract resume text'}), 500

        job_description = request.form.get('jobDescription', '').strip()
        if not job_description:
            return jsonify({'error': 'Job Description is required'}), 400
        cleaned_jd = clean_job_description(job_description)

        job_title = request.form.get('jobTitle', '').strip()
        experience_level = request.form.get('experienceLevel', '').strip()
        user_email = request.form.get('email', 'unknown').strip()

        llm_result = analyze_with_llm(resume_text, cleaned_jd, job_title, experience_level)

        if user_email and user_email != 'unknown':
            resume_embedding = get_embedding(resume_text)
            db.resumes.update_one(
                {"email": user_email},
                {"$set": {
                    "resume_text": resume_text,
                    "embedding": resume_embedding,
                    "updated_at": datetime.utcnow(),
                }},
                upsert=True
            )

        return jsonify({
            'resumeText': resume_text,
            'jobDescription': job_description,
            'jobTitle': job_title,
            'experienceLevel': experience_level,
            'llmAnalysis': llm_result
        })

    except Exception as e:
        print("[ERROR] Server Error:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    try:
        seniority = request.args.get('seniority')
        keyword = request.args.get('keyword')
        jobs = get_jobs(seniority=seniority, keyword=keyword)
        return jsonify(jobs)
    except Exception as e:
        print("[ERROR] /api/jobs:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/jobs/matches', methods=['GET'])
def job_matches():
    try:
        user_email = request.args.get('email', '').strip()
        if not user_email:
            return jsonify({'error': 'email is required'}), 400

        resume_doc = db.resumes.find_one({"email": user_email})
        if not resume_doc or not resume_doc.get("embedding"):
            return jsonify({'error': 'No resume found for this user. Please upload a resume first.'}), 404

        seniority = request.args.get('seniority')
        jobs = get_jobs_with_embeddings(seniority=seniority)

        resume_skills = set(extract_skills(resume_doc.get("resume_text", "")))
        scored = score_jobs_for_resume(resume_doc["embedding"], jobs, resume_skills)

        return jsonify(scored)
    except Exception as e:
        print("[ERROR] /api/jobs/matches:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


# --- tracker routes ---
@app.route('/api/tracker', methods=['POST'])
def save_tracker_status():
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        job_id = data.get('job_id', '').strip()
        status = data.get('status', '').strip()

        if not email or not job_id or not status:
            return jsonify({'error': 'email, job_id, and status are all required'}), 400

        upsert_tracker_entry(email, job_id, status)

        response = {'message': 'Status saved', 'job_id': job_id, 'status': status}
        return jsonify(response)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print("[ERROR] /api/tracker POST:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/tracker', methods=['GET'])
def list_tracked_jobs():
    try:
        email = request.args.get('email', '').strip()
        if not email:
            return jsonify({'error': 'email is required'}), 400

        status = request.args.get('status')
        sort = request.args.get('sort', 'newest')
        jobs = get_tracked_jobs(email, status=status, sort=sort)
        counts = get_tracker_counts(email)

        return jsonify({'jobs': jobs, 'counts': counts})
    except Exception as e:
        print("[ERROR] /api/tracker GET:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/tracker/<job_id>', methods=['DELETE'])
def delete_tracker_entry(job_id):
    try:
        email = request.args.get('email', '').strip()
        if not email:
            return jsonify({'error': 'email is required'}), 400

        removed = remove_tracker_entry(email, job_id)
        return jsonify({'removed': removed})
    except Exception as e:
        print("[ERROR] /api/tracker DELETE:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/tracker/<job_id>/notes', methods=['PATCH'])
def patch_tracker_notes(job_id):
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        notes = data.get('notes', '')

        if not email:
            return jsonify({'error': 'email is required'}), 400

        update_notes(email, job_id, notes)
        return jsonify({'message': 'Notes saved', 'job_id': job_id})
    except Exception as e:
        print("[ERROR] /api/tracker/<job_id>/notes PATCH:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/tracker/<job_id>/interview', methods=['PATCH'])
def patch_tracker_interview(job_id):
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        interview_date = data.get('interview_date')
        interview_notes = data.get('interview_notes')

        if not email:
            return jsonify({'error': 'email is required'}), 400

        set_interview_details(email, job_id, interview_date=interview_date, interview_notes=interview_notes)
        return jsonify({'message': 'Interview details saved', 'job_id': job_id})
    except Exception as e:
        print("[ERROR] /api/tracker/<job_id>/interview PATCH:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500



@app.route('/api/tracker/<job_id>/followup', methods=['PATCH'])
def patch_tracker_followup(job_id):
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        follow_up_date = data.get('follow_up_date')  

        if not email:
            return jsonify({'error': 'email is required'}), 400

        parsed_date = None
        if follow_up_date:
            
            parsed_date = datetime.fromisoformat(follow_up_date)

        set_follow_up_date(email, job_id, follow_up_date=parsed_date)
        return jsonify({
            'message': 'Follow-up date saved',
            'job_id': job_id,
            'follow_up_date': parsed_date.isoformat() if parsed_date else None,
        })
    except ValueError:
        return jsonify({'error': 'follow_up_date must be a valid ISO date string'}), 400
    except Exception as e:
        print("[ERROR] /api/tracker/<job_id>/followup PATCH:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route("/api/tracker/status", methods=["GET"])
def get_tracker_statuses():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "email is required"}), 400

    docs = db.tracker.find(
        {"email": email},
        {"job_id": 1, "status": 1, "_id": 0},
    )

    status_map = {doc["job_id"]: doc["status"] for doc in docs}
    return jsonify(status_map), 200


# --- interview practice routes ---
@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        mode = data.get('mode', '').strip()  
        context = data.get('context', {})

        if not email or mode not in ('job', 'custom'):
            return jsonify({'error': 'email and a valid mode are required'}), 400

        session_id = create_session(email, mode, context)
        result = get_next_question(session_id)

        return jsonify({
            'session_id': session_id,
            'question': result['question'],
            'complete': result['complete'],
        })
    except Exception as e:
        print("[ERROR] /api/interview/start:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/interview/<session_id>/answer', methods=['POST'])
def answer_interview(session_id):
    try:
        data = request.json or {}
        answer_text = data.get('answer', '').strip()

        if not answer_text:
            return jsonify({'error': 'answer is required'}), 400

        add_user_answer(session_id, answer_text)
        result = get_next_question(session_id)

        response = {
            'question': result['question'],
            'complete': result['complete'],
        }

        if result['complete']:
            response['report'] = generate_report(session_id)

        return jsonify(response)
    except Exception as e:
        print("[ERROR] /api/interview/<id>/answer:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/interview/<session_id>/end', methods=['POST'])
def end_interview_early(session_id):
    try:
        session = get_session(session_id)
        if not session:
            return jsonify({'error': 'session not found'}), 404

        if session.get('status') == 'completed':
            return jsonify({'report': session.get('report')})

        user_turns = [m for m in session['messages'] if m['role'] == 'user']
        if not user_turns:
            return jsonify({'error': 'Answer at least one question before ending the interview.'}), 400

        report = generate_report(session_id)
        return jsonify({'report': report})
    except Exception as e:
        print("[ERROR] /api/interview/<id>/end:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/interview/<session_id>/report', methods=['GET'])
def get_interview_report(session_id):
    try:
        session = get_session(session_id)
        if not session:
            return jsonify({'error': 'session not found'}), 404
        if session.get('status') != 'completed':
            return jsonify({'error': 'interview not finished yet'}), 400
        return jsonify({'report': session['report']})
    except Exception as e:
        print("[ERROR] /api/interview/<id>/report:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/interview/transcribe', methods=['POST'])
def transcribe_interview_answer():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'audio file is required'}), 400

        audio_bytes = audio_file.read()
        text = transcribe_audio(audio_bytes, filename=audio_file.filename or "answer.webm")

        return jsonify({'text': text})
    except Exception as e:
        print("[ERROR] /api/interview/transcribe:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


# --- homepage guide + chat assistant ---
@app.route('/api/guide/status', methods=['GET'])
def guide_status():
    try:
        email = request.args.get('email', '').strip()
        if not email:
            return jsonify({'error': 'email is required'}), 400

        return jsonify(get_guide_status(email))
    except Exception as e:
        print("[ERROR] /api/guide/status:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/assistant/chat', methods=['POST'])
def assistant_chat():
    try:
        data = request.json or {}
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        history = data.get('history', [])

        if not message:
            return jsonify({'error': 'message is required'}), 400

        reply = chat_with_assistant(email, message, history)
        return jsonify({'reply': reply})
    except Exception as e:
        print("[ERROR] /api/assistant/chat:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


@app.route('/api/jobs/refresh', methods=['POST'])
def refresh_jobs():
    try:
        query = request.json.get('query', 'backend developer')
        country = request.json.get('country', 'in')

        raw_jobs = fetch_jobs(query, country)
        count = 0
        for raw_job in raw_jobs:
            seniority, confidence = classify_seniority(
                raw_job.get('job_title', ''), raw_job.get('job_description', '')
            )
            skills = extract_skills(raw_job.get('job_description', ''))
            upsert_job(raw_job, seniority, confidence, skills)
            count += 1

        return jsonify({'message': f'Fetched and stored {count} jobs'})
    except Exception as e:
        print("[ERROR] /api/jobs/refresh:", e)
        return jsonify({'error': f'Unexpected server error: {str(e)}'}), 500


def deactivate_stale_jobs(days=14):
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = db.jobs.update_many(
        {"fetched_at": {"$lt": cutoff}}, {"$set": {"is_active": False}}
    )
    print(f"[SCHEDULER] Deactivated {result.modified_count} stale jobs")


def scheduled_job_refresh():
    with app.app_context():
        try:
            deactivate_stale_jobs()
            raw_jobs = fetch_jobs("backend developer", "in")
            count = 0
            for raw_job in raw_jobs:
                seniority, confidence = classify_seniority(
                    raw_job.get('job_title', ''), raw_job.get('job_description', '')
                )
                skills = extract_skills(raw_job.get('job_description', ''))
                upsert_job(raw_job, seniority, confidence, skills)
                count += 1
            print(f"[SCHEDULER] Refreshed {count} jobs at {datetime.utcnow()}")
        except Exception as e:
            print("[SCHEDULER] Refresh failed:", e)


scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_job_refresh, 'interval', hours=6)
scheduler.start()


if __name__ == '__main__':
    ensure_indexes()
    ensure_tracker_indexes()
    ensure_interview_indexes()
    app.run(debug=True, use_reloader=False)
import os
from datetime import datetime
from bson import ObjectId
from groq import Groq
from job_store import db


def get_latest_resume_text(email: str) -> str:
    doc = db.resumes.find_one({"email": email})
    return doc.get("resume_text", "") if doc else ""


MODEL = "openai/gpt-oss-120b"
QUESTIONS_PER_SESSION = 6  

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def transcribe_audio(file_bytes: bytes, filename: str = "answer.webm") -> str:
    """
    Sends a recorded audio clip to Groq's Whisper model and returns the
    transcribed text. Used for the "listening" half of the voice loop —
    the browser records with MediaRecorder, this turns it into text.
    """
    transcription = client.audio.transcriptions.create(
        file=(filename, file_bytes),
        model="whisper-large-v3",
        response_format="text",
    )
    
    if isinstance(transcription, str):
        return transcription.strip()
    return getattr(transcription, "text", "").strip()


def ensure_interview_indexes():
    db.interview_sessions.create_index([("email", 1), ("created_at", -1)])


def _build_system_prompt(mode: str, context: dict) -> str:
    """
    mode: "job" or "custom"
    context: {
        "role": str,            # job title, or custom topic
        "company": str,         # company name, or "" for custom mode
        "jd_text": str,         # job description, or "" for custom mode
        "resume_text": str,     # candidate's resume or pasted background text
    }
    """
    role = context.get("role") or "this role"
    company = context.get("company")
    jd_text = context.get("jd_text") or ""
    resume_text = context.get("resume_text") or ""

    target_line = f"for the role of {role}" + (f" at {company}" if company else "")

    return f"""You are an experienced, friendly interviewer conducting a spoken mock interview {target_line}.

Job description / focus area:
{jd_text or "(no specific job description provided — ask general but relevant questions for this role/topic)"}

Candidate background:
{resume_text or "(no resume provided — ask questions without assuming specific past experience)"}

Rules:
- Ask exactly ONE question at a time. Never ask multiple questions in one turn.
- Keep each question short and natural, like real spoken conversation (1-3 sentences). No markdown, no numbered lists, no headers.
- Base questions on the job description and resume where relevant. Mix in a few behavioral questions.
- If the candidate's last answer was vague or shallow, ask a natural follow-up before moving on.
- Do not summarize, evaluate, or give feedback during the interview — save that for the end.
- Sound like a real human interviewer: warm but focused, not robotic.
"""


def create_session(email: str, mode: str, context: dict) -> str:
    doc = {
        "email": email,
        "mode": mode,  
        "context": context,
        "messages": [],  
        "status": "active",
        "created_at": datetime.utcnow(),
    }
    result = db.interview_sessions.insert_one(doc)
    return str(result.inserted_id)


def get_session(session_id: str) -> dict:
    return db.interview_sessions.find_one({"_id": ObjectId(session_id)})


def get_next_question(session_id: str) -> dict:
    """
    Calls the LLM with the running conversation and returns the next thing
    the interviewer should say. Returns {"question": str, "complete": bool}.
    """
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")

    user_turns = [m for m in session["messages"] if m["role"] == "user"]
    if len(user_turns) >= QUESTIONS_PER_SESSION:
        return {"question": None, "complete": True}

    system_prompt = _build_system_prompt(session["mode"], session["context"])

    chat_messages = [{"role": "system", "content": system_prompt}]
    for m in session["messages"]:
        chat_messages.append({"role": m["role"], "content": m["content"]})

    if not session["messages"]:
        chat_messages.append({
            "role": "user",
            "content": "Please begin the interview with your first question."
        })

    response = client.chat.completions.create(
        model=MODEL,
        messages=chat_messages,
        temperature=0.7,
        max_tokens=200,
    )
    question_text = response.choices[0].message.content.strip()

    db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"messages": {"role": "assistant", "content": question_text}}}
    )

    return {"question": question_text, "complete": False}


def add_user_answer(session_id: str, answer_text: str):
    db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"messages": {"role": "user", "content": answer_text}}}
    )


def generate_report(session_id: str) -> dict:
    """
    Scores the full transcript and returns structured feedback.
    """
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")

    transcript_lines = []
    for m in session["messages"]:
        speaker = "Interviewer" if m["role"] == "assistant" else "Candidate"
        transcript_lines.append(f"{speaker}: {m['content']}")
    transcript_text = "\n".join(transcript_lines)

    scoring_prompt = f"""Here is a full mock interview transcript:

{transcript_text}

Evaluate the candidate's performance. Respond ONLY with valid JSON, no other text, in exactly this shape:
{{
  "overall_score": <integer 1-10>,
  "summary": "<2-3 sentence overall summary>",
  "strengths": ["<short point>", "<short point>"],
  "areas_to_improve": ["<short point>", "<short point>"],
  "per_question_feedback": [
    {{"question": "<the question asked>", "feedback": "<1-2 sentence feedback on the answer>"}}
  ]
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": scoring_prompt}],
        temperature=0.3,
        max_tokens=1200,
    )

    import json
    raw = response.choices[0].message.content.strip()
    
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    report = json.loads(raw)

    db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "completed", "report": report, "completed_at": datetime.utcnow()}}
    )

    return report

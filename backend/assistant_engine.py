import os
from groq import Groq
from job_store import db
from tracker_store import get_tracker_counts

MODEL = "llama-3.3-70b-versatile"  

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))



def get_guide_status(email: str) -> dict:
    resume_doc = db.resumes.find_one({"email": email})
    resume_done = bool(resume_doc and resume_doc.get("resume_text"))

    counts = get_tracker_counts(email) or {}
    
    job_tracked = sum(counts.values()) > 0 if counts else False

    interview_done = db.interview_sessions.count_documents(
        {"email": email, "status": "completed"}
    ) > 0

    return {
        "resume_done": resume_done,
        "job_tracked": job_tracked,
        "interview_done": interview_done,
    }



def _build_system_prompt(email: str) -> str:
    resume_doc = db.resumes.find_one({"email": email}) if email else None
    resume_snippet = ""
    if resume_doc and resume_doc.get("resume_text"):
       
        resume_snippet = resume_doc["resume_text"][:800]

    counts = get_tracker_counts(email) if email else {}
    counts_line = ", ".join(f"{k}: {v}" for k, v in counts.items()) if counts else "no jobs tracked yet"

    interview_count = (
        db.interview_sessions.count_documents({"email": email, "status": "completed"})
        if email else 0
    )

    return f"""You are a friendly, concise assistant embedded on the homepage of ResumeIQ,
a job search + resume + interview prep tool. You help the user with resume
and job-search planning, and point them to the right part of the app.

The app has these pages: Upload (analyze a resume against a job description),
Job Search (browse matched job listings), My Jobs (track application status),
Interview Prep (live spoken mock interviews with scoring).

What we know about this user right now:
- Resume on file: {"yes" if resume_snippet else "no"}
{f"- Resume excerpt: {resume_snippet}" if resume_snippet else ""}
- Tracked jobs by status: {counts_line}
- Completed mock interviews: {interview_count}

Rules:
- Keep answers short — 2-4 sentences, plain text, no markdown headers or lists unless the user asks for a list.
- Give specific, actionable advice using the data above where relevant (e.g. if no resume yet, say so and point to Upload).
- If a resume is already on file, never tell the user to "upload their resume" as if they haven't — instead, if relevant, point them to Upload to re-analyze it against a specific job description, or to Job Search / My Jobs / Interview Prep depending on what they're asking.
- If asked something outside resume/job/interview planning, gently redirect back to what you can help with.
- Never invent details about the user's resume or jobs beyond what's given above.
"""


def chat_with_assistant(email: str, message: str, history: list) -> str:
    """
    history: list of {"role": "user"|"assistant", "text": str}, most recent
    last. Frontend keeps this in memory only — nothing is persisted server-side.
    """
    system_prompt = _build_system_prompt(email)

    chat_messages = [{"role": "system", "content": system_prompt}]
    for turn in (history or [])[-8:]:  
        role = "user" if turn.get("role") == "user" else "assistant"
        chat_messages.append({"role": role, "content": turn.get("text", "")})
    chat_messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL,
        messages=chat_messages,
        temperature=0.5,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()
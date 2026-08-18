# LLMHandler.py
import os
import json
import traceback
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ---------------------------------------------------------------------------
# NOTE ON THE MIGRATION (read this if the analysis stops working again):
#
# The old `google-generativeai` package was deprecated on Nov 30, 2025 and is
# being sunset — that's why the previous integration broke, not an expired
# key. This file uses the new unified `google-genai` SDK instead
# (pip install google-genai / pip uninstall google-generativeai).
#
# Model: gemini-3.6-flash — current GA flash model as of Aug 2026, free-tier
# eligible (no credit card), 1M token context. Google retires older Gemini
# generations periodically (2.0 in June 2026, 2.5-flash for new keys shortly
# after) — if this model name ever 404s again with "no longer available",
# check https://ai.google.dev/gemini-api/docs/latest-model for whatever the
# current GA flash model is and swap MODEL_NAME below. Nothing else in this
# file needs to change when that happens.
# ---------------------------------------------------------------------------

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = genai.Client(api_key=api_key)
EMBEDDING_MODEL = "gemini-embedding-001"
MODEL_NAME = "gemini-3.6-flash"


RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "executive_summary": {"type": "string"},
        "resume_score": {"type": "integer"},
        "resume_score_comment": {"type": "string"},
        "match_percentage": {"type": "integer"},
        "ats_score": {"type": "integer"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "improvements": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "point": {"type": "string"},
                    "why_it_matters": {"type": "string"},
                },
                "required": ["point", "why_it_matters"],
            },
        },
        "profile_review": {"type": "string"},
        "skills": {
            "type": "object",
            "properties": {
                "current_technical": {"type": "array", "items": {"type": "string"}},
                "current_soft": {"type": "array", "items": {"type": "string"}},
                "current_domain": {"type": "array", "items": {"type": "string"}},
                "missing": {"type": "array", "items": {"type": "string"}},
                "proficiency_note": {"type": "string"},
            },
            "required": [
                "current_technical",
                "current_soft",
                "current_domain",
                "missing",
                "proficiency_note",
            ],
        },
        "experience_analysis": {"type": "string"},
        "education_review": {"type": "string"},
        "suggested_projects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "tools": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["title", "description", "tools"],
            },
        },
        "courses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "platform": {"type": "string"},
                    "reason": {"type": "string"},
                },
                "required": ["name", "platform", "reason"],
            },
        },
        "motivation_tip": {"type": "string"},
    },
    "required": [
        "executive_summary",
        "resume_score",
        "resume_score_comment",
        "match_percentage",
        "ats_score",
        "strengths",
        "improvements",
        "profile_review",
        "skills",
        "experience_analysis",
        "education_review",
        "suggested_projects",
        "courses",
        "motivation_tip",
    ],
}

def get_embedding(text: str) -> list[float]:
    """Turn text into a vector for similarity comparison (resume-to-job matching)."""
    try:
        
        truncated = text[:8000]
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=truncated,
        )
        return response.embeddings[0].values
    except Exception as e:
        print("[Embedding error]:", e)
        traceback.print_exc()
        return None
    
def create_prompt(resume_text, job_description_text, job_title, experience_level):
    prompt = f"""
You are a senior career coach, professional resume writer, and ATS optimization
expert with 15+ years of experience across tech, product, and business roles.

Analyze the candidate's resume against the target role below. Be specific and
concrete — cite actual details from the resume (tools, numbers, project names,
job titles) rather than generic advice. Be honest about weaknesses but keep the
tone constructive and encouraging, never harsh.

Target Role: {job_title}
Experience Level: {experience_level}

Scoring guidance:
- resume_score: overall resume quality (writing, structure, impact) out of 100.
- match_percentage: how well the resume aligns with THIS specific job description, out of 100.
- ats_score: how well an Applicant Tracking System would parse and rank this resume, out of 100.
Do not default to round numbers like 70/80/90 — give a realistic, differentiated score based on actual resume quality.

Content guidance:
- strengths: 5-7 specific, evidence-based strengths (reference real resume content).
- improvements: 5-7 items, each with a concrete "point" and a "why_it_matters" explaining the impact and how to fix it.
- skills.current_technical / current_soft / current_domain: categorize skills actually evidenced in the resume.
- skills.missing: skills the job description implies or requires that are absent from the resume.
- suggested_projects: 2-4 portfolio projects targeting the missing skills, each with a short description and concrete tools.
- courses: 5-7 real, well-known courses/certifications (Coursera, freeCodeCamp, Udemy, LinkedIn Learning, official vendor certs, etc.) relevant to closing the gaps.
- motivation_tip: a short, warm, specific closing note tailored to this candidate — not generic filler.

Return ONLY valid JSON matching the provided schema. No markdown, no code fences, no commentary outside the JSON.

Candidate Resume:
{resume_text}

Job Description:
{job_description_text}
"""
    return prompt.strip()


def analyze_with_llm(resume_text, job_description_text, job_title, experience_level):
    prompt = create_prompt(resume_text, job_description_text, job_title, experience_level)
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RESPONSE_SCHEMA,
                
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print("[LLM error]:", e)
        traceback.print_exc()
        return {
            "error": "Error occurred while generating analysis. Please try again.",
        }



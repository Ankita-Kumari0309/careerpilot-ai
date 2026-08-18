import math

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)

def score_jobs_for_resume(resume_embedding: list[float], jobs: list[dict], resume_skills: set = None) -> list[dict]:
    scored = []
    for job in jobs:
        job_embedding = job.get("embedding")
        if not job_embedding:
            continue
        similarity = cosine_similarity(resume_embedding, job_embedding)
        match_percent = round(similarity * 100)

        missing_skills = []
        if resume_skills:
            job_skills = set(s.lower() for s in job.get("skills", []))
            missing_skills = sorted(job_skills - resume_skills)

        job_copy = {k: v for k, v in job.items() if k != "embedding"}
        job_copy["match_percent"] = match_percent
        job_copy["missing_skills"] = missing_skills
        scored.append(job_copy)

    scored.sort(key=lambda j: j["match_percent"], reverse=True)
    return scored
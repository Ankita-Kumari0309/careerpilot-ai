from pymongo import MongoClient
import os
from datetime import datetime
from LLMHandler import get_embedding

_client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/resumate"))
db = _client.get_default_database()

def upsert_job(raw_job: dict, seniority: str, confidence: float, skills: list[str]):
    external_id = raw_job.get("job_uid") or raw_job.get("job_id")
    if not external_id:
        return

    description = raw_job.get("job_description") or ""

   
    existing = db.jobs.find_one({"external_id": external_id}, {"embedding": 1})
    embedding = existing.get("embedding") if existing else None
    if embedding is None:
        embedding = get_embedding(description)

    db.jobs.update_one(
        {"external_id": external_id},
        {"$set": {
            "title": raw_job.get("job_title"),
            "company": raw_job.get("employer_name"),
            "location": raw_job.get("job_city") or raw_job.get("job_state") or raw_job.get("job_country"),
            "description": description,
            "apply_url": raw_job.get("job_apply_link"),
            "seniority": seniority,
            "seniority_confidence": confidence,
            "skills": skills,
            "embedding": embedding,
            "fetched_at": datetime.utcnow(),
            "is_active": True,
            "raw_payload": raw_job,
        }},
        upsert=True
    )

def get_jobs(seniority: str = None, keyword: str = None, limit: int = 50):
    query = {"is_active": True}
    if seniority:
        query["seniority"] = seniority
    if keyword:
        query["$text"] = {"$search": keyword}
    
    jobs = list(db.jobs.find(query, {"embedding": 0}).sort("fetched_at", -1).limit(limit))
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs

def get_jobs_with_embeddings(seniority: str = None, limit: int = 100):
    """Used only by the match-score endpoint — includes the embedding field."""
    query = {"is_active": True, "embedding": {"$ne": None}}
    if seniority:
        query["seniority"] = seniority
    jobs = list(db.jobs.find(query).sort("fetched_at", -1).limit(limit))
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs

def ensure_indexes():
    db.jobs.create_index("external_id", unique=True)
    db.jobs.create_index("seniority")
    db.jobs.create_index([("title", "text"), ("description", "text")])
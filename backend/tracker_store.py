from job_store import db
from datetime import datetime, timedelta
from bson import ObjectId

VALID_STATUSES = {"saved", "applied", "interviewing", "rejected", "offer"}


FOLLOW_UP_DAYS = 7


def upsert_tracker_entry(email: str, job_id: str, status: str, notes: str = None):
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {status}")

    update_fields = {
        "email": email,
        "job_id": job_id,
        "status": status,
        "updated_at": datetime.utcnow(),
    }

    if notes is not None:
        update_fields["notes"] = notes

    
    if status == "applied":
        existing = db.tracker.find_one({"email": email, "job_id": job_id})
        if not existing or not existing.get("follow_up_date"):
            update_fields["follow_up_date"] = datetime.utcnow() + timedelta(days=FOLLOW_UP_DAYS)
       
    elif status in ("interviewing", "rejected", "offer"):
        
        update_fields["follow_up_date"] = None

    db.tracker.update_one(
        {"email": email, "job_id": job_id},
        {"$set": update_fields},
        upsert=True
    )


def update_notes(email: str, job_id: str, notes: str):
    """Save/edit the free-text note on a tracked job."""
    db.tracker.update_one(
        {"email": email, "job_id": job_id},
        {"$set": {"notes": notes, "updated_at": datetime.utcnow()}}
    )


def set_interview_details(email: str, job_id: str, interview_date=None, interview_notes=None):
    """Attach an interview date and/or prep notes to a tracked job."""
    fields = {"updated_at": datetime.utcnow()}
    if interview_date is not None:
        fields["interview_date"] = interview_date
    if interview_notes is not None:
        fields["interview_notes"] = interview_notes

    db.tracker.update_one(
        {"email": email, "job_id": job_id},
        {"$set": fields}
    )



def set_follow_up_date(email: str, job_id: str, follow_up_date=None):
    db.tracker.update_one(
        {"email": email, "job_id": job_id},
        {"$set": {"follow_up_date": follow_up_date, "updated_at": datetime.utcnow()}}
    )


def get_tracked_jobs(email: str, status: str = None, sort: str = "newest"):
    query = {"email": email}
    if status:
        query["status"] = status

    sort_dir = 1 if sort == "oldest" else -1
    entries = list(db.tracker.find(query).sort("updated_at", sort_dir))

    result = []
    for entry in entries:
        try:
            job = db.jobs.find_one({"_id": ObjectId(entry["job_id"])}, {"embedding": 0})
        except Exception:
            job = None
        if job:
            job["_id"] = str(job["_id"])
            job["tracker_status"] = entry["status"]
            job["tracked_at"] = entry["updated_at"]
            job["notes"] = entry.get("notes", "")
            job["follow_up_date"] = entry.get("follow_up_date")
            job["interview_date"] = entry.get("interview_date")
            job["interview_notes"] = entry.get("interview_notes", "")
            result.append(job)
    return result


def get_tracker_counts(email: str):
    """Counts per status, for the tab badges (Saved (3), Applied (5), ...)."""
    counts = {status: 0 for status in VALID_STATUSES}
    for entry in db.tracker.find({"email": email}):
        if entry["status"] in counts:
            counts[entry["status"]] += 1
    return counts


def remove_tracker_entry(email: str, job_id: str):
    result = db.tracker.delete_one({"email": email, "job_id": job_id})
    return result.deleted_count > 0


def ensure_tracker_indexes():
    db.tracker.create_index([("email", 1), ("job_id", 1)], unique=True)
import requests
import os
from dotenv import load_dotenv

load_dotenv()

JSEARCH_HOST = "jsearch.p.rapidapi.com"

def fetch_jobs(query: str, country: str = "in", num_pages: int = 1):
    """Fetch raw job postings from JSearch. Returns a list of raw job dicts."""
    api_key = os.getenv("JSEARCH_API_KEY")
    if not api_key:
        raise ValueError("JSEARCH_API_KEY not set in .env")

    resp = requests.get(
        f"https://{JSEARCH_HOST}/search-v2",
        headers={
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": JSEARCH_HOST,
        },
        params={
            "query": query,
            "num_pages": str(num_pages),
            "country": country,
            "date_posted": "all",
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json().get("data", {}).get("jobs", [])
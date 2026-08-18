import re

SENIOR_PATTERN = re.compile(r"\b(senior|sr\.?|staff|principal|lead)\b", re.I)
JUNIOR_PATTERN = re.compile(r"\b(junior|jr\.?|entry.?level|graduate|intern)\b", re.I)
YOE_PATTERN = re.compile(r"(\d+)\+?\s*(?:-\s*\d+\s*)?years?\s+(?:of\s+)?experience", re.I)

def classify_seniority(title: str, description: str) -> tuple[str, float]:
    """Returns (level, confidence). Rule-based only for now — add an LLM
    fallback later by importing analyze_with_llm from LLMHandler if needed."""
    title = title or ""
    description = description or ""

    if SENIOR_PATTERN.search(title):
        return "senior", 0.9
    if JUNIOR_PATTERN.search(title):
        return "junior", 0.9

    yoe_match = YOE_PATTERN.search(description)
    if yoe_match:
        years = int(yoe_match.group(1))
        if years <= 2:
            return "junior", 0.7
        elif years <= 5:
            return "mid", 0.7
        else:
            return "senior", 0.7

    return "mid", 0.4  


def extract_skills(description: str, skill_list: list[str] = None) -> list[str]:
    """Simple keyword match against a known skill list."""
    if skill_list is None:
        skill_list = [
            "python", "flask", "django", "react", "node.js", "javascript",
            "mongodb", "postgresql", "sql", "aws", "docker", "kubernetes",
            "git", "rest api", "graphql", "redis", "celery",
        ]
    description_lower = (description or "").lower()
    return [skill for skill in skill_list if skill in description_lower]
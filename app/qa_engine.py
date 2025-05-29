import json
import os
import subprocess
from typing import Optional, Tuple, List
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load data
TDS_NOTES_PATH = "data/tds_notes.json"
DISCOURSE_PATH = "data/posts.json"

def load_data():
    notes = []
    if os.path.exists(TDS_NOTES_PATH):
        with open(TDS_NOTES_PATH, "r", encoding="utf-8") as f:
            notes += json.load(f)
    if os.path.exists(DISCOURSE_PATH):
        with open(DISCOURSE_PATH, "r", encoding="utf-8") as f:
            notes += json.load(f)
    return notes

DOCUMENTS = load_data()

def normalize_url(url: str) -> str:
    try:
        parsed = urlparse(url)
        if "/t/" in parsed.path:
            parts = parsed.path.split("/")
            if len(parts) > 4 and parts[-1].isdigit():
                parts = parts[:-1]
            normalized_path = "/".join(parts)
            return f"{parsed.scheme}://{parsed.netloc}{normalized_path}"
    except Exception:
        pass
    return url

def retrieve_relevant_docs(question: str, top_k: int = 5) -> List[dict]:
    from sentence_transformers import SentenceTransformer
    import qdrant_client
    from qdrant_client.http.models import Distance

    qdrant_host = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_collection = os.getenv("QDRANT_COLLECTION", "tds_docs")

    client = qdrant_client.QdrantClient(url=qdrant_host)
    model = SentenceTransformer("all-MiniLM-L6-v2")
    question_vector = model.encode(question).tolist()

    hits = client.search(
        collection_name=qdrant_collection,
        query_vector=question_vector,
        limit=top_k
    )

    return [hit.payload for hit in hits]

def call_ollama(prompt: str) -> str:
    result = subprocess.run(
        ["ollama", "run", "llama3", "--no-cache"],
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore"
    )
    return result.stdout.strip()

def get_answer(question: str, image: Optional[str] = None) -> Tuple[str, List[dict]]:
    relevant_docs = retrieve_relevant_docs(question)

    context = "\n\n".join([
        f'{d.get("topic_title", "")}\n{d["content"]}' for d in relevant_docs if "content" in d
    ])

    prompt = f"""
You are a helpful TA answering student questions from the Tools in Data Science course.
Use the context below to answer the question clearly and briefly.
If possible, cite specific URLs. 
Context:
{context}

Question: {question}
Answer:
"""

    print("🧠 Final Prompt:\n", prompt)  # Log the prompt being sent to Ollama

    answer = call_ollama(prompt)

    seen = set()
    links = []
    for doc in relevant_docs:
        if "url" in doc:
            url = normalize_url(doc["url"])
            if url not in seen:
                links.append({"url": url, "text": "Related reference"})
                seen.add(url)
        elif "links" in doc:
            for url in doc["links"]:
                if isinstance(url, str):
                    url = normalize_url(url)
                    if url not in seen:
                        links.append({"url": url, "text": "Related reference"})
                        seen.add(url)

    return answer, links

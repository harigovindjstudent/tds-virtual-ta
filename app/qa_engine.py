import json
import os
import subprocess
from typing import Optional, Tuple, List
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import qdrant_client
from qdrant_client.http.models import Filter, SearchRequest, PointStruct, VectorParams, Distance

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

# Load model globally
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load Qdrant client globally
qdrant_host = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant_collection = os.getenv("QDRANT_COLLECTION", "tds_docs")
client = qdrant_client.QdrantClient(url=qdrant_host)

def retrieve_relevant_docs(question: str, top_k: int = 5) -> List[dict]:
    question_vector = model.encode(question).tolist()

    hits = client.search(
        collection_name=qdrant_collection,
        query_vector=question_vector,
        limit=top_k
    )

    return [hit.payload for hit in hits]

def call_ollama(prompt: str) -> str:
    result = subprocess.run(
        ["ollama", "run", "llama3"],
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
Use only the provided context. If the answer is not in the context, state that you cannot answer based on the given information.

Context:
{context}

Question: {question}
Answer:
"""

    answer = call_ollama(prompt)

    # Collect unique links from the relevant docs
    seen = set()
    links = []
    for doc in relevant_docs:
        if "url" in doc and doc["url"] not in seen:
            links.append({"url": doc["url"], "text": "Related reference"})
            seen.add(doc["url"])
        elif "links" in doc:
            for url in doc["links"]:
                if isinstance(url, str) and url not in seen:
                    links.append({"url": url, "text": "Related reference"})
                    seen.add(url)

    return answer, links

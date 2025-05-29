import json
import os
from uuid import uuid4
from urllib.parse import urlparse
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance

# Load environment variables
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "tds_docs")

# Load data
with open("data/tds_notes.json", "r", encoding="utf-8") as f:
    tds_notes = json.load(f)

with open("data/posts.json", "r", encoding="utf-8") as f:
    discourse_posts = json.load(f)

data = tds_notes + discourse_posts

# Normalize URL by removing trailing post ID (e.g., /123/4 -> /123)
def normalize_url(url):
    try:
        parsed = urlparse(url)
        if "/t/" in parsed.path:
            parts = parsed.path.split("/")
            if len(parts) > 4 and parts[-1].isdigit():
                parts = parts[:-1]  # remove the trailing post number
            normalized_path = "/".join(parts)
            return f"{parsed.scheme}://{parsed.netloc}{normalized_path}"
    except Exception:
        pass
    return url

# Initialize model and client
model = SentenceTransformer("all-MiniLM-L6-v2")
client = QdrantClient(url=QDRANT_URL)

# Create or recreate collection
client.recreate_collection(
    collection_name=QDRANT_COLLECTION,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# Build and upload points in batches
BATCH_SIZE = 500
batch = []
total_uploaded = 0

for i, item in enumerate(data, 1):
    content = item.get("content", "")
    topic = item.get("topic_title", "")
    full_text = f"{topic}\n{content}".strip()
    vector = model.encode(full_text).tolist()
    url = normalize_url(item.get("url", ""))
    payload = {
        "source": item.get("source", ""),
        "content": content,
        "topic_title": topic,
        "url": url,
        "date": item.get("date", "")
    }
    batch.append(PointStruct(id=str(uuid4()), vector=vector, payload=payload))

    if len(batch) >= BATCH_SIZE:
        client.upsert(collection_name=QDRANT_COLLECTION, points=batch)
        total_uploaded += len(batch)
        print(f"📦 Uploaded batch of {len(batch)} points. Total: {total_uploaded}")
        batch = []

# Upload remaining
if batch:
    client.upsert(collection_name=QDRANT_COLLECTION, points=batch)
    total_uploaded += len(batch)
    print(f"📦 Uploaded final batch of {len(batch)} points. Total: {total_uploaded}")

print(f"✅ Uploaded {total_uploaded} documents to Qdrant.")

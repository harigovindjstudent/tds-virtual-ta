import json
import os
from uuid import uuid4
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

# Initialize model and client
model = SentenceTransformer("all-MiniLM-L6-v2")
client = QdrantClient(url=QDRANT_URL)

# Create or recreate collection
client.recreate_collection(
    collection_name=QDRANT_COLLECTION,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# Build points
points = []
for item in data:
    content = item.get("content", "")
    topic = item.get("topic_title", "")
    full_text = f"{topic}\n{content}".strip()
    vector = model.encode(full_text).tolist()
    payload = {
        "source": item.get("source", ""),
        "content": content,
        "topic_title": topic,
        "url": item.get("url", ""),
        "date": item.get("date", ""),
        # New fields added for hierarchy
        "post_number": item.get("post_number", None),
        "reply_to_post_number": item.get("reply_to_post_number", None)
    }
    points.append(PointStruct(id=str(uuid4()), vector=vector, payload=payload))

# Upload to Qdrant in batches
BATCH_SIZE = 500
for i in range(0, len(points), BATCH_SIZE):
    batch = points[i:i+BATCH_SIZE]
    client.upsert(collection_name=QDRANT_COLLECTION, points=batch)
    print(f"🚀 Uploaded batch {i // BATCH_SIZE + 1}")

print(f"✅ Uploaded {len(points)} documents to Qdrant.")

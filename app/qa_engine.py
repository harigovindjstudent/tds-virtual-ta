import json
import os
import subprocess
import base64
from typing import Optional, Tuple, List
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import pytesseract

# Load environment variables (if needed for future use)
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

def retrieve_relevant_docs(question: str, top_k: int = 5) -> List[dict]:
    # Basic keyword search (can be replaced with embeddings)
    question_lower = question.lower()
    ranked = sorted(DOCUMENTS, key=lambda d: question_lower in d["content"].lower(), reverse=True)
    return ranked[:top_k]

def call_ollama(prompt: str) -> str:
    try:
        result = subprocess.run(
            ["ollama", "run", "llama3"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        if result.returncode != 0:
            print("[ERROR] Ollama failed:", result.stderr)
            return "[ERROR] LLM failed to respond."
        return result.stdout.strip()
    except Exception as e:
        print("[EXCEPTION] Ollama subprocess failed:", e)
        return "[ERROR] Ollama execution failed."

def extract_text_from_image(image_base64: str) -> str:
    try:
        header, encoded = image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        image = Image.open(BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception as e:
        print("[ERROR] Failed to process image:", e)
        return ""

def get_answer(question: str, image: Optional[str] = None) -> Tuple[str, List[dict]]:
    # Step 1: Process image if provided
    image_text = ""
    if image:
        print("[INFO] Image received, extracting text...")
        image_text = extract_text_from_image(image)

    # Step 2: Merge question with extracted image text (if any)
    full_question = question
    if image_text.strip():
        full_question += f"\n\nImage Text: {image_text.strip()}"

    # Step 3: Retrieve relevant context
    relevant_docs = retrieve_relevant_docs(full_question)
    context = "\n\n".join([d["content"] for d in relevant_docs])

    # Step 4: Formulate the prompt
    prompt = f"""
You are a helpful TA answering student questions from the Tools in Data Science (TDS) course at IIT Madras.
Make sure to interpret GA1–GA7 as graded assignments, not Google Analytics.
Use the context below to answer the question clearly and briefly.
If possible, cite specific URLs.

Context:
{context}

Question (TDS course-related): {full_question}
Answer:
"""

    # Step 5: Get the answer from LLM
    answer = call_ollama(prompt)

    # Step 6: Extract related links
    seen = set()
    links = []
    for doc in relevant_docs:
        if "links" in doc:
            for url in doc["links"]:
                if isinstance(url, str) and url not in seen:
                    links.append({"url": url, "text": "Related reference"})
                    seen.add(url)

    return answer, links

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import base64

from app.qa_engine import get_answer  # This function should return (answer_str, links_list)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    image: Optional[str] = None

class Link(BaseModel):
    url: str
    text: str

class QueryResponse(BaseModel):
    answer: str
    links: List[Link] = []

@app.post("/api/", response_model=QueryResponse)
def process_question(request: QueryRequest):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question is required")

    answer, links = get_answer(request.question, request.image)
    return QueryResponse(answer=answer, links=links)

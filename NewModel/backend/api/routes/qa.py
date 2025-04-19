# File: backend/api/routes/qa.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.dependencies import get_db
from qa.pipeline import QAPipeline
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
qa_pipeline = QAPipeline()

class QuestionRequest(BaseModel):
    question: str

class QuestionResponse(BaseModel):
    question: str
    answer: str
    confidence_score: float = 0.0
    sources: Optional[List[str]] = None
    audio_url: Optional[str] = None  # Added audio_url field

@router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):
    """Process a question and return an answer with audio"""
    logger.info(f"Received question: {request.question}")

    try:
        # Get response from QA pipeline
        response = await qa_pipeline.get_answer(request.question)
        
        # Return response with audio URL
        return {
            "question": request.question,
            "answer": response["answer"],
            "confidence_score": response.get("confidence_score", 0.0),
            "sources": response.get("sources", []),
            "audio_url": response.get("audio_url")  # Include audio URL in response
        }
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Check if the QA system is operational"""
    try:
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"System unhealthy: {str(e)}"
        )
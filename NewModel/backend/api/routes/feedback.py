from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from api.deps import get_db, get_current_user
from database.models import User, Feedback
from typing import List, Optional
from pydantic import BaseModel, Field

router = APIRouter()

# Pydantic models for data validation
class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)  # Rating between 1-5
    feedback_text: str = Field(..., min_length=10)
    improvement_suggestions: Optional[str] = None
    category: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    rating: int
    feedback_text: str
    improvement_suggestions: Optional[str]
    category: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit feedback from the current user."""
    try:
        new_feedback = Feedback(
            user_id=current_user.id,
            rating=feedback_data.rating,
            feedback_text=feedback_data.feedback_text,
            improvement_suggestions=feedback_data.improvement_suggestions,
            category=feedback_data.category
        )
        
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return new_feedback
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not submit feedback"
        )

@router.get("/feedback", response_model=List[FeedbackResponse])
def get_user_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all feedback submitted by the current user."""
    feedback_list = db.query(Feedback).filter(Feedback.user_id == current_user.id).all()
    return feedback_list 
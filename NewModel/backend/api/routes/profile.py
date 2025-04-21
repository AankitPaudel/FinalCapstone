from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from api.deps import get_db, get_current_user
from database.models import User, StudentProfile
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for data validation
class StudentProfileCreate(BaseModel):
    full_name: str
    department: str
    major: str
    semester: int
    year_of_study: Optional[int] = None
    interests: Optional[str] = None
    goals: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    major: Optional[str] = None
    semester: Optional[int] = None
    year_of_study: Optional[int] = None
    interests: Optional[str] = None
    goals: Optional[str] = None

class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    department: str
    major: str
    semester: int
    year_of_study: Optional[int]
    interests: Optional[str]
    goals: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.post("/profile", response_model=StudentProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new student profile for the authenticated user."""
    # Check if profile already exists
    existing_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    # Create new profile
    try:
        new_profile = StudentProfile(
            user_id=current_user.id,
            full_name=profile_data.full_name,
            department=profile_data.department,
            major=profile_data.major,
            semester=profile_data.semester,
            year_of_study=profile_data.year_of_study,
            interests=profile_data.interests,
            goals=profile_data.goals
        )
        
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create profile"
        )

@router.get("/profile", response_model=StudentProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("/profile", response_model=StudentProfileResponse)
def update_profile(
    profile_data: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the current user's profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update only the fields that are provided
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    try:
        db.commit()
        db.refresh(profile)
        return profile
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update profile"
        ) 
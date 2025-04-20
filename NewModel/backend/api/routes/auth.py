from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.session import get_db
from database.models.user import User
from api.schemas.auth import UserCreate, UserResponse, Token, PasswordResetRequest, PasswordReset, CollegeIDRequest
from api.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_reset_token, 
    send_password_reset_email
)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if student ID already exists
    existing_student_id = db.query(User).filter(User.student_id == user_data.student_id).first()
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        student_id=user_data.student_id,
        college_id=user_data.college_id,
        password_hash=hashed_password
    )
    
    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Log in and obtain an access token."""
    # Find user by student ID
    user = db.query(User).filter(User.student_id == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect student ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/request-password-reset")
async def request_password_reset(
    request_data: PasswordResetRequest, 
    request: Request, 
    db: Session = Depends(get_db)
):
    """Request a password reset link via email."""
    # Find user by email
    user = db.query(User).filter(User.email == request_data.email).first()
    
    # Whether user exists or not, we return success to prevent email enumeration
    if not user:
        return {"detail": "If a user with this email exists, a password reset link has been sent"}
    
    # Generate reset token and set expiry
    reset_token = create_reset_token()
    token_expires = datetime.utcnow() + timedelta(hours=1)
    
    # Update user with reset token
    user.reset_token = reset_token
    user.reset_token_expires = token_expires
    db.commit()
    
    # Build reset URL
    # In production, this would be a frontend URL
    base_url = str(request.base_url)
    reset_url = f"{base_url}reset-password?token={reset_token}"
    
    # Send email
    send_password_reset_email(user.email, reset_url)
    
    return {"detail": "If a user with this email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password using reset token."""
    # Find user by reset token
    user = db.query(User).filter(User.reset_token == reset_data.token).first()
    
    # Check if user exists and token is valid
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Update password
    user.password_hash = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"detail": "Password has been reset successfully"}

@router.post("/request-college-id")
async def request_college_id(request_data: CollegeIDRequest, db: Session = Depends(get_db)):
    """Request college ID recovery via email."""
    # Find user by email and student ID
    user = db.query(User).filter(
        User.email == request_data.email,
        User.student_id == request_data.student_id
    ).first()
    
    # Whether user exists or not, we return success to prevent enumeration
    if not user:
        return {"detail": "If a matching account exists, college ID information has been sent to your email"}
    
    # Send email with college ID
    # In a real implementation, you would use the send_email function
    # For now, we'll just pretend we sent it
    
    return {"detail": "If a matching account exists, college ID information has been sent to your email"} 
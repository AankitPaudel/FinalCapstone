from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from datetime import datetime
import uuid
from .base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Personal information
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    major = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    
    # Additional information
    year_of_study = Column(Integer, nullable=True)
    interests = Column(String, nullable=True)
    goals = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<StudentProfile {self.full_name}>" 
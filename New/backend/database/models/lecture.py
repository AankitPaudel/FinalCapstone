# File: backend/database/models/lecture.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .base import Base

class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)  # Added length constraint
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Lecture(id={self.id}, title='{self.title}')>"
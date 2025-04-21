from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from datetime import datetime
import uuid
from .base import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Feedback content
    rating = Column(Integer, nullable=False)  # 1-5 star rating
    feedback_text = Column(Text, nullable=False)
    improvement_suggestions = Column(Text, nullable=True)
    
    # Metadata
    category = Column(String, nullable=True)  # UI, Content, Performance, etc.
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Feedback {self.id} from user {self.user_id}>" 
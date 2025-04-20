from sqlalchemy import create_engine
from database.models.user import Base as UserBase
from database.models.lecture import Base as LectureBase
import os
from pathlib import Path

# Get the base directory
BASE_DIR = Path(__file__).parent

# Database URL
DATABASE_URL = f"sqlite:///{BASE_DIR}/virtual_teacher.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only needed for SQLite
)

def init_db():
    # Create tables for all models
    UserBase.metadata.create_all(bind=engine)
    LectureBase.metadata.create_all(bind=engine)
    
    print("All database tables created successfully!")

if __name__ == "__main__":
    # Initialize the database
    init_db() 
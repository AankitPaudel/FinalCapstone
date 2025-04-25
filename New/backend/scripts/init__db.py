# File: backend/scripts/init_db.py
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).parent.parent.absolute())
sys.path.append(backend_dir)

from sqlalchemy.ext.declarative import declarative_base
from database.session import engine, SessionLocal
from database.models.lecture import Lecture
from database.models.user import User, Base as UserBase
from database.models.lecture import Base as LectureBase

def init_database():
    try:
        print("Creating database tables...")
        # Create all tables
        LectureBase.metadata.create_all(bind=engine)
        UserBase.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully!")

        # Test database by adding a sample lecture
        db = SessionLocal()
        try:
            # Check if we already have lectures
            existing_lecture = db.query(Lecture).first()
            
            if not existing_lecture:
                print("Adding sample lecture...")
                sample_lecture = Lecture(
                    title="Introduction to Programming",
                    content="""
                    Welcome to Programming!
                    
                    This is a sample lecture that introduces basic programming concepts.
                    Key topics include:
                    - Variables and Data Types
                    - Control Structures
                    - Functions
                    - Object-Oriented Programming
                    """
                )
                db.add(sample_lecture)
                db.commit()
                print("✓ Sample lecture added successfully!")
            else:
                print("✓ Database already contains lectures!")

        finally:
            db.close()
            
        print("\nDatabase initialization complete!")
        
    except Exception as e:
        print(f"Error during database initialization: {str(e)}")
        raise

if __name__ == "__main__":
    init_database()
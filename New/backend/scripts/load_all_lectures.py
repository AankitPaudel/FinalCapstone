# File: backend/scripts/load_all_lectures.py
from pathlib import Path
import sys
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from database import SessionLocal, Lecture
from rag.processor import RAGProcessor
import os

def load_all_lectures():
    """Load all lecture files from the data/lectures directory"""
    
    lectures_dir = Path(backend_dir) / "data" / "lectures"
    
    if not lectures_dir.exists():
        print(f"Error: Lectures directory not found at {lectures_dir}")
        return
    
    lecture_files = list(lectures_dir.glob("*.txt"))
    
    if not lecture_files:
        print("No lecture files found")
        return
        
    print(f"Found {len(lecture_files)} lecture files to process")
    
    processed_count = 0
    
    try:
        # Initialize database session
        db = SessionLocal()
        
        # Initialize RAG processor
        processor = RAGProcessor()
        
        for lecture_file in lecture_files:
            try:
                # Read lecture content
                with open(lecture_file, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Determine lecture title from first line or filename
                title = content.strip().split('\n')[0][:100]  # Use first line as title, limited to 100 chars
                if not title or title.isspace():
                    title = lecture_file.stem  # Use filename if first line is empty
                
                print(f"Processing: {lecture_file.name} - {title}")
                
                # Check if lecture already exists with same title
                existing_lecture = db.query(Lecture).filter(Lecture.title == title).first()
                
                if existing_lecture:
                    # Update existing lecture
                    existing_lecture.content = content
                    db.commit()
                    db.refresh(existing_lecture)
                    lecture_id = existing_lecture.id
                    print(f"  ↳ Updated existing lecture (ID: {lecture_id})")
                else:
                    # Create new lecture
                    lecture = Lecture(
                        title=title,
                        content=content
                    )
                    db.add(lecture)
                    db.commit()
                    db.refresh(lecture)
                    lecture_id = lecture.id
                    print(f"  ↳ Added new lecture (ID: {lecture_id})")
                
                # Process lecture for RAG system
                processor.process_lecture(lecture_id, content)
                print(f"  ↳ Processed for RAG system ✓")
                
                processed_count += 1
                
            except Exception as e:
                print(f"  ↳ Error processing {lecture_file.name}: {str(e)}")
        
        print(f"\nSuccessfully processed {processed_count} out of {len(lecture_files)} lecture files")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    load_all_lectures() 
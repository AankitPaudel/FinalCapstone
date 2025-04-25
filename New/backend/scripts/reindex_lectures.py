#!/usr/bin/env python
# Script to reindex all lecture files with special emphasis on Lectures32.txt

import os
import logging
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.config import settings
from rag.processor import RAGProcessor
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Reindex all lecture files with special emphasis on creator info"""
    try:
        # Initialize the RAG processor
        rag_processor = RAGProcessor()
        
        # Connect to the database
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Get lecture files
        lectures_dir = os.path.join(backend_dir, "data", "lectures")
        lecture_files = sorted(os.listdir(lectures_dir))
        
        logger.info(f"Found {len(lecture_files)} lecture files to process")
        
        # Process each lecture file
        for i, filename in enumerate(lecture_files):
            lecture_id = i + 1
            file_path = os.path.join(lectures_dir, filename)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Special treatment for Lectures32.txt (creator info) to ensure it gets found
            # We'll add some boosting keywords to help the semantic search
            if filename == "Lectures32.txt":
                logger.info(f"Processing creator info file: {filename}")
                # Add boosting keywords at the beginning and end
                boosted_content = (
                    "CREATOR INFORMATION. DEVELOPERS. WHO MADE THIS. WHO CREATED THIS APP. "
                    "APPLICATION CREATORS. DEVELOPMENT TEAM. TEAM MEMBERS. AUTHORS. "
                    f"{content}"
                    "CREATOR INFORMATION. DEVELOPERS. WHO MADE THIS. WHO CREATED THIS APP. "
                    "APPLICATION CREATORS. DEVELOPMENT TEAM. TEAM MEMBERS. AUTHORS. "
                )
                # Process with boosted content
                rag_processor.process_lecture(lecture_id, boosted_content)
                
                # Update database record if exists, otherwise create new
                try:
                    db.execute(
                        text("UPDATE lectures SET content = :content WHERE id = :id"),
                        {"content": content, "id": lecture_id}
                    )
                except:
                    db.execute(
                        text("INSERT INTO lectures (id, title, content) VALUES (:id, :title, :content)"),
                        {"id": lecture_id, "title": filename, "content": content}
                    )
            else:
                logger.info(f"Processing lecture file: {filename}")
                rag_processor.process_lecture(lecture_id, content)
                
                # Update database record if exists, otherwise create new
                try:
                    db.execute(
                        text("UPDATE lectures SET content = :content WHERE id = :id"),
                        {"content": content, "id": lecture_id}
                    )
                except:
                    db.execute(
                        text("INSERT INTO lectures (id, title, content) VALUES (:id, :title, :content)"),
                        {"id": lecture_id, "title": filename, "content": content}
                    )
        
        db.commit()
        logger.info("All lecture files have been reindexed successfully")
        
    except Exception as e:
        logger.error(f"Error reindexing lectures: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 
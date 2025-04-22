import logging
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from app.config import settings
import os

logger = logging.getLogger(__name__)

class RAGProcessor:
    def __init__(self):
        logger.info("Initializing RAG Processor...")
        try:
            # Using updated configuration for the latest OpenAI client
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=settings.OPENAI_API_KEY,
                model="text-embedding-3-small"  # Updated to a newer model
            )
            
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            
            # Make sure the vector store directory exists
            os.makedirs(settings.VECTOR_STORE_PATH, exist_ok=True)
            
            # Initialize vector store
            self.vector_store = Chroma(
                persist_directory=settings.VECTOR_STORE_PATH,
                embedding_function=self.embeddings
            )
            
            logger.info("RAG Processor initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG Processor: {str(e)}")
            raise

    # ... rest of the code remains unchanged 
# File: backend/rag/processor.py
import logging
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from app.config import settings
import os

logger = logging.getLogger(__name__)

class RAGProcessor:
    def __init__(self):
        logger.info("Initializing RAG Processor...")
        try:
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=settings.OPENAI_API_KEY
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

    def process_lecture(self, lecture_id: int, content: str) -> None:
        """Process lecture content and store in vector store"""
        try:
            # Split text into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Prepare documents
            metadatas = [{
                "lecture_id": lecture_id,
                "chunk_id": i,
                "source": f"lecture_{lecture_id}"
            } for i in range(len(chunks))]
            
            # Add to vector store
            self.vector_store.add_texts(
                texts=chunks,
                metadatas=metadatas
            )
            
            # In newer versions of Chroma/LangChain, persist() is no longer needed
            # It seems to auto-persist when using a persist_directory
            try:
                # Try to call persist if available
                if hasattr(self.vector_store, 'persist'):
                    self.vector_store.persist()
            except Exception as e:
                logger.info(f"Auto-persist assumed, no manual persist needed: {str(e)}")
            
            logger.info(f"Successfully processed lecture {lecture_id} with {len(chunks)} chunks")
            
        except Exception as e:
            logger.error(f"Error processing lecture: {str(e)}")
            raise

    async def find_relevant_context(self, question: str, num_chunks: int = 2):  # Reduced from 3
        """Find relevant context for a question"""
        try:
            # Check if there's any data in the vector store
            collection = self.vector_store._collection
            if collection.count() == 0:
                logger.warning("Vector store is empty - no lectures loaded")
                return []

            # Perform similarity search with only the basic parameters
            results = self.vector_store.similarity_search(
                question,
                k=num_chunks  # Reduced from 3 → 2 for faster lookup
            )

            # Format results
            context_docs = [{
                "content": doc.page_content,
                "metadata": doc.metadata
            } for doc in results]

            logger.info(f"Found {len(context_docs)} relevant chunks for question")
            return context_docs

        except Exception as e:
            logger.error(f"Error finding relevant context: {str(e)}")
            raise

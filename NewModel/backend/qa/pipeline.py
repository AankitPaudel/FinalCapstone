# File: backend/qa/pipeline.py
from typing import Dict, Optional
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from app.config import settings
from rag.processor import RAGProcessor
from audio.text_to_speech import TextToSpeech
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QAPipeline:
    def __init__(self):
        """Initialize the QA Pipeline with OpenAI, RAG, and TTS components"""
        logger.info("Initializing QA Pipeline...")
        
        # Verify OpenAI API key
        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key is not set")
            raise ValueError("OpenAI API key is not set")
        
        try:
            # Initialize components
            self.rag_processor = RAGProcessor()
            self.text_to_speech = TextToSpeech()
            
            # Initialize OpenAI LLM
            self.llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.3,
                max_tokens=250,
                openai_api_key=settings.OPENAI_API_KEY,
                request_timeout=20,
                streaming=True
            )

            logger.info("QA Pipeline initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing QA Pipeline: {str(e)}")
            raise

    async def get_answer(self, question: str) -> Dict:
        """Process question and generate answer using predefined responses, RAG, and OpenAI."""
        logger.info(f"Processing question: {question}")

        try:
            # ✅ Step 1: Check for predefined responses
            predefined_responses = {
                "what is your name?": "I am the virtual model of Dr. Terry Soule, here to assist you with computer science-related topics. My 3D visual model is in progress, but right now, I am here to help you verbally.",
                "what do you do?": "I am the virtual model of Dr. Terry Soule, here to assist you with computer science-related topics. My 3D visual model is in progress, but right now, I am here to help you verbally.",
                "tell me about yourself?": "I am the virtual model of Dr. Terry Soule, here to assist you with computer science-related topics. My 3D visual model is in progress, but right now, I am here to help you verbally."
            }

            # 🔑 Normalize question for comparison (lowercase, trimmed)
            normalized_question = question.lower().strip()

            # 👉 If the question matches, return the predefined response immediately
            for key, response in predefined_responses.items():
                if key in normalized_question:
                    logger.info(f"Matched predefined question: '{key}'")

                    # 🎙️ Convert custom answer to speech
                    try:
                        audio_file = await self.text_to_speech.convert(response)
                        audio_url = f"/api/audio/responses/{audio_file.name}"
                        logger.info(f"Generated custom audio response: {audio_url}")
                    except Exception as audio_error:
                        logger.error(f"Error generating audio for custom response: {audio_error}")
                        audio_url = None

                    # 🚀 Return custom response
                    return {
                        "question": question,
                        "answer": response,
                        "confidence_score": 1.0,
                        "sources": ["Predefined Response"],
                        "audio_url": audio_url
                    }

            # 🟢 Step 2: Proceed with RAG if not a custom question
            context_docs = await self.rag_processor.find_relevant_context(question)
            
            if not context_docs:
                logger.warning("No relevant context found in knowledge base")
                return {
                    "question": question,
                    "answer": "I don't have enough information in my knowledge base to answer this question. Please make sure lecture content has been loaded.",
                    "confidence_score": 0.0,
                    "sources": [],
                    "audio_url": None
                }

            # Join context
            context = "\n".join([doc["content"] for doc in context_docs])
            
            # Create messages using LangChain schema
            messages = [
                SystemMessage(content="You are a helpful teaching assistant. Use the provided context to answer questions accurately and educationally."),
                HumanMessage(content=f"Using this context:\n{context}\n\nAnswer this question: {question}")
            ]

            # Generate LLM response
            response = await self.llm.agenerate([messages])
            answer = response.generations[0][0].text

            # Generate audio for LLM answer
            try:
                audio_file = await self.text_to_speech.convert(answer)
                audio_url = f"/api/audio/responses/{audio_file.name}"
                logger.info(f"Generated audio response: {audio_file}")
            except Exception as audio_error:
                logger.error(f"Error generating audio: {audio_error}")
                audio_url = None

            # Prepare final result
            result = {
                "question": question,
                "answer": answer,
                "sources": [doc["metadata"].get("source", "unknown") for doc in context_docs],
                "confidence_score": self._calculate_confidence(context_docs, answer),
                "audio_url": audio_url
            }
            
            logger.info(f"Successfully generated answer with audio URL: {audio_url}")
            return result

        except Exception as e:
            logger.error(f"Error in get_answer: {str(e)}", exc_info=True)
            return {
                "question": question,
                "answer": "I encountered an error while processing your question. Please try again.",
                "confidence_score": 0.0,
                "sources": [],
                "audio_url": None
            }

    def _calculate_confidence(self, context_docs: list, answer: str) -> float:
        """Calculate a confidence score based on context and answer."""
        if not context_docs:
            return 0.0
        
        # Confidence based on context richness
        context_score = min(len(context_docs) / 3, 1.0)
        answer_length_score = min(len(answer) / 500, 1.0)
        
        return (context_score * 0.7 + answer_length_score * 0.3) * 0.8  # Scaled to 0.8 max

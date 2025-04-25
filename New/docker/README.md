# Docker Setup for NewModel

This directory contains Docker configuration files to run the entire NewModel application stack with a single command.

## Prerequisites

- Docker and Docker Compose installed on your system
- OpenAI API key

## Setup

1. Create a `.env` file in this directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key
   ```

2. Build and start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000
   - Database: PostgreSQL running on port 5432

## Services

The setup includes the following services:

- **Backend**: FastAPI application with RAG capabilities and text-to-speech conversion
- **Frontend**: React application with Vite
- **Database**: PostgreSQL database for storing user profiles, feedback, and other data

## Volumes

The following volumes are mapped to persist data:

- `postgres_data`: PostgreSQL database files
- `../backend/data`: All application data including lecture materials
- `../backend/data/lectures`: Lecture text files for RAG system
- `../backend/data/vector_store`: Vector embeddings for the RAG system

## Troubleshooting

- If you encounter permission issues with the data directories, you may need to run `chmod -R 777 ../backend/data` from the docker directory.
- If the frontend shows a white screen, try accessing the diagnostic page at http://localhost:3001/diagnostic
- Make sure your OpenAI API key is valid and has sufficient credits/usage limit. 
# File: backend/database/models/base.py
from sqlalchemy.ext.declarative import declarative_base

# Create a single Base instance to be shared by all models
Base = declarative_base() 
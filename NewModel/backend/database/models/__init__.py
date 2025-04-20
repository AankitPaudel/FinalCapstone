# File: backend/database/models/__init__.py
from .lecture import Lecture
from .user import User

# Export these for easy access
__all__ = [
    'Lecture',
    'User'
]
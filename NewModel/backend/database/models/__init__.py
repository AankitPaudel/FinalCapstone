# File: backend/database/models/__init__.py
from .base import Base
from .lecture import Lecture
from .user import User
from .student_profile import StudentProfile
from .feedback import Feedback

# Export these for easy access
__all__ = [
    'Base',
    'Lecture',
    'User',
    'StudentProfile',
    'Feedback'
]
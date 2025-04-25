from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class UserBase(BaseModel):
    email: EmailStr
    student_id: str
    college_id: str

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('student_id')
    def student_id_format(cls, v):
        if not re.match(r'^\d{8,12}$', v):
            raise ValueError('Student ID must be 8-12 digits')
        return v
    
    @validator('college_id')
    def college_id_format(cls, v):
        if not v or len(v) < 3:
            raise ValueError('College ID is required and must be at least 3 characters')
        return v

class UserLogin(BaseModel):
    student_id: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool

    class Config:
        orm_mode = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class CollegeIDRequest(BaseModel):
    email: EmailStr
    student_id: str 
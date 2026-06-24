from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    nama: str
    no_hp: str
    role: str = "customer" # admin atau customer

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime
    alamat: Optional[str] = None
    koordinat: Optional[dict] = None
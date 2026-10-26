from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    name_with_initials: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    mobile: str = Field(pattern=r"^0\d{9}$")                    # e.g. 0771234567
    nic: str = Field(pattern=r"^(\d{12})$")         # old or new NIC
    address: str = Field(min_length=3, max_length=200)
    school: str = Field(min_length=2, max_length=200)
    gender: Literal["Male", "Female"]
    institute_id: int
    exam_year: int = Field(ge=2000, le=2100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
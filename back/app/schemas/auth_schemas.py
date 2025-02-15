import uuid

from pydantic import BaseModel
from typing import List


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


class UserKeycloak(BaseModel):
    email_verified: bool
    groups: List[str]
    preferred_username: str
    sub: uuid.UUID

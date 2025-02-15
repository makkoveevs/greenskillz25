from fastapi import APIRouter

from app.api.endpoints import auth, presentations

b3_router = APIRouter()
b3_router.include_router(auth.router, prefix="/auth", tags=["auth"])
b3_router.include_router(presentations.router, prefix="/presentations", tags=["presentations"])

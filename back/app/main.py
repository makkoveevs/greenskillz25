from fastapi import FastAPI, Depends
from loguru import logger
from starlette.middleware.cors import CORSMiddleware

from app.api.api import b3_router
from app.core.config import settings
from app.core.minio_client import MinioClient
from app.api.deps import keycloak_client

# Будет подменяться на версию из тега при деплое.

logger.add(
    "./logs/file_manager/logs.log",
    level="INFO",
    format="{time} - {name} - {level} - {message} - {module}",
    rotation="50 MB",
    retention=10,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=True
    )

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.on_event("startup")
async def startup_event():
    # создание пользователей в keycloack
    await keycloak_client.initialize_keycloak()
    # создание бакета в minio
    s3_client = MinioClient()
    await s3_client.client
    await s3_client.check_bucket()

app.include_router(b3_router, prefix=settings.API_V1_STR)

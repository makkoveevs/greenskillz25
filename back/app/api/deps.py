from fastapi import Depends
from app.core.auth import KeycloakClient
from app.core.minio_client import MinioClient
from app.core.postgres import DBWork, get_db
from sqlalchemy.ext.asyncio import AsyncSession

keycloak_client = KeycloakClient()


async def get_db_work(session: AsyncSession = Depends(get_db)):
    return DBWork(session)


async def get_minio_client():
    s3_client = MinioClient()
    await s3_client.client
    return s3_client

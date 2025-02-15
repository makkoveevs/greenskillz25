from minio import Minio
from minio.error import S3Error
from app.core.config import settings


client = Minio(
    settings.MINIO_ENDPOINT_URL,  # Адрес MinIO
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False  # False для HTTP, True для HTTPS
)


def download_file(file_path, local_path):
    file_path = settings.MINIO_BUCKET + '/' + file_path
    client.fget_object(settings.MINIO_BUCKET, file_path, local_path)
from minio import Minio
from minio.error import S3Error
from app.core.config import settings


client = Minio(
    settings.MINIO_ENDPOINT_URL,  # Адрес MinIO
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_ACCESS_KEY,
    secure=False  # False для HTTP, True для HTTPS
)


def download_file(file_path, local_path):
    print(f'----------------{file_path}')
    client.fget_object(settings.MINIO_BUCKET, file_path, local_path)

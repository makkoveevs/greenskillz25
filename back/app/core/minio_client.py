import io
from miniopy_async import Minio

from app.core.config import settings


class MinioClient:
    def __init__(self):
        self.session = None

    @property
    async def client(self):
        self.session = Minio(
            settings.MINIO_ENDPOINT_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,  # Если MinIO не настроен для HTTPS
        )
        return self

    async def check_bucket(self):
        found = await self.session.bucket_exists(settings.MINIO_BUCKET)
        if found:
            print(f"✅ Бакет '{settings.MINIO_BUCKET}' уже существует.")
        else:
            # Создаём бакет
            await self.session.make_bucket(settings.MINIO_BUCKET)
            print(f"🚀 Бакет '{settings.MINIO_BUCKET}' создан!")

    async def create_file(self, object_name: str, data: bytes) -> bool:
        """Загружает данные в объект Minio в указанном бакете (bucket)."""
        try:
            data_length = len(data)
            await self.session.put_object(
                settings.MINIO_BUCKET, str(object_name), io.BytesIO(data), data_length
            )
            return True
        except Exception as e:
            # logger.error(f"An error occurred: {e}")
            return False
from pydantic import PostgresDsn
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "gamma_app_killer"
    SERVICE_PG_HOST: str = "localhost"
    SERVICE_PG_PORT: int = "5433"
    SERVICE_PG_USER:str = "postgres2"
    SERVICE_PG_PASSWORD: str = "greenskils"
    SERVICE_PG_DB: str = "greenskils"

    KEYCLOAK_URL: str = "http://localhost:8085"
    KEYCLOAK_REALM: str = "myrealm"
    KEYCLOAK_CLIENT_ID: str = "myclient"
    KEYCLOAK_CLIENT_SECRET: str = "tvs42AmYAG31vcGVPDIHZsUr4nM4CB3B"
    KEYCLOAK_ADMIN: str = "erroradmin"
    KEYCLOAK_ADMIN_PASSWORD: str = "erroradmin"

    DEFAULT_ADMIN_GROUP: str = "admins"

    MINIO_ENDPOINT_URL: str = "localhost:9000"
    MINIO_SECURE: bool = False  # Если MinIO не настроен для HTTPS
    MINIO_BUCKET: str = "delta"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    class Config:
        case_sensitive = True
        # для прода поменять на "./.env"
        # env_file = "./.env.local"
        env_file = "./.env"

    @property
    def get_default_user(self):
        return "a28a223c-61a3-4a4e-87cb-77cfdd979b85"

    @property
    def pg_conn(self) -> str:
        postgres_dsn = PostgresDsn(
            f"postgresql+asyncpg://{self.SERVICE_PG_USER}:{self.SERVICE_PG_PASSWORD}@{self.SERVICE_PG_HOST}:{self.SERVICE_PG_PORT}/{self.SERVICE_PG_DB}"
        )
        return postgres_dsn.__str__()

    @property
    def pg_celery_conn(self) -> str:
        # Создаем строку подключения для синхронного подключения (psycopg2)
        postgres_dsn = PostgresDsn(
            f"postgresql+psycopg2://{self.SERVICE_PG_USER}:{self.SERVICE_PG_PASSWORD}@{self.SERVICE_PG_HOST}:{self.SERVICE_PG_PORT}/{self.SERVICE_PG_DB}"
        )
        return postgres_dsn.__str__()

    # Админ API для Keycloak
    @property
    def base_admin_api(self) -> str:
        return f"{self.KEYCLOAK_URL}admin/realms/{self.KEYCLOAK_REALM}"

    @property
    def user_admin_api(self) -> str:
        return f"{self.base_admin_api}/users"

    @property
    def group_admin_api(self) -> str:
        return f"{self.base_admin_api}/groups"


settings = Settings()
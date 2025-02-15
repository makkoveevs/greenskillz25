import requests
import time
from fastapi import Depends, HTTPException, Security
from keycloak import KeycloakOpenID
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.schemas.auth_schemas import UserKeycloak

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
DEFAULT_GROUP = settings.DEFAULT_ADMIN_GROUP
DEFAULT_USERS = [
    {"username": "admin_user", "password": "admin123", "group": "admins"},
    {"username": "regular_user", "password": "user123", "group": None},
]


class KeycloakClient:
    def __init__(self):
        # Конфигурируем Keycloak
        self.keycloak_openid = KeycloakOpenID(
            server_url=settings.KEYCLOAK_URL,
            client_id=settings.KEYCLOAK_CLIENT_ID,
            realm_name=settings.KEYCLOAK_REALM,
            client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
        )

    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> UserKeycloak:
        """ Проверяем JWT-токен """
        try:
            user_info = self.keycloak_openid.userinfo(token)
            if not user_info:
                raise HTTPException(status_code=401, detail="Invalid token")
            # Получаем ID пользователя
            user_id = user_info.get("sub")

            # Запрашиваем группы пользователя через Admin API
            groups = await self.get_user_groups(user_id)

            # Добавляем группы в user_info
            user_info["groups"] = groups

            return UserKeycloak(**user_info)
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

    async def get_user_groups(self, user_id: str):
        """ Получаем группы пользователя через Keycloak Admin API """
        try:
            token = await self.get_keycloak_admin_token()
            headers = {"Authorization": f"Bearer {token}"}
            url = f"{settings.user_admin_api}/{user_id}/groups"

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            # Парсим список групп
            groups = [group["name"] for group in response.json()]
            return groups
        except Exception:
            return []

    # Функция для получения токена администратора Keycloak
    @staticmethod
    async def get_keycloak_admin_token():
        url = f"{settings.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
        data = {
            'client_id': 'admin-cli',
            'username': settings.KEYCLOAK_ADMIN,
            'password': settings.KEYCLOAK_ADMIN_PASSWORD,
            'grant_type': 'password'
        }
        response = requests.post(url, data=data)
        response_data = response.json()
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Could not get Keycloak admin token")
        return response_data['access_token']

    # Функция для создания нового пользователя
    async def create_user_in_keycloak(self, username: str, password: str):
        token = await self.get_keycloak_admin_token()

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        user_data = {
            "username": username,
            "enabled": True,
            "credentials": [{
                "type": "password",
                "value": password,
                "temporary": False
            }]
        }

        response = requests.post(settings.user_admin_api, json=user_data, headers=headers)
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail="Error creating user in Keycloak")

    async def get_or_create_group(self, token, group_name):
        """Проверяет, существует ли группа, если нет – создаёт её."""
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.get(settings.group_admin_api, headers=headers)

        if response.status_code == 200:
            for group in response.json():
                if group["name"] == group_name:
                    return group["id"]  # Группа уже существует

        # Создаем группу, если её нет
        response = requests.post(settings.group_admin_api, json={"name": group_name}, headers=headers)
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail="Ошибка создания группы в Keycloak")

        return response.headers["Location"].split("/")[-1]  # Возвращаем ID созданной группы

    async def get_or_create_user(self, token, user_data):
        """Проверяет, существует ли пользователь, если нет – создаёт его."""
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.get(f"{settings.user_admin_api}?username={user_data['username']}", headers=headers)

        if response.status_code == 200 and response.json():
            return response.json()[0]["id"]  # Пользователь уже существует

        # Создаем пользователя
        new_user = {
            "username": user_data["username"],
            "enabled": True,
            "credentials": [{"type": "password", "value": user_data["password"], "temporary": False}],
        }
        response = requests.post(settings.user_admin_api, json=new_user, headers=headers)
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"Ошибка создания пользователя {user_data['username']}")

        # Получаем ID нового пользователя
        user_id = response.headers["Location"].split("/")[-1]
        return user_id

    async def add_user_to_group(self, token, user_id, group_id):
        """Добавляет пользователя в группу."""
        url = f"{settings.user_admin_api}/{user_id}/groups/{group_id}"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.put(url, headers=headers)
        if response.status_code != 204:
            raise HTTPException(status_code=500, detail="Ошибка добавления пользователя в группу")

    async def initialize_keycloak(self):
        """Запускается при старте приложения и создаёт пользователей и группы."""
        # time.sleep(15)  # Ждем, пока Keycloak полностью запустится
        token = await self.get_keycloak_admin_token()

        # Создаём группу "admins"
        group_id = await self.get_or_create_group(token, DEFAULT_GROUP)

        # Создаём пользователей и добавляем в группу
        for user in DEFAULT_USERS:
            user_id = await self.get_or_create_user(token, user)
            if user["group"]:
                await self.add_user_to_group(token, user_id, group_id)

        print("✅ Keycloak: пользователи и группа созданы!")

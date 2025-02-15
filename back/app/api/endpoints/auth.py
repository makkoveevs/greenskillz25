from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import keycloak_client, get_db_work
from app.core.postgres import DBWork, Sort
from app.models.models import PresentationResult, PresentationRequest
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, UserKeycloak
from app.schemas.presentations_schema import MyPresentationsRequestList, PresentationsRequestResponseCompleted
from app.core.config import settings

router = APIRouter()


@router.post("/login")
async def login(data: LoginRequest):
    """ Авторизация пользователя через Keycloak """
    try:
        token = keycloak_client.keycloak_openid.token(data.username, data.password)
        return {"access_token": token["access_token"], "refresh_token": token["refresh_token"]}
    except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid credentials")


@router.get("/me")
async def protected_route(db_work: DBWork = Depends(get_db_work)):
    """ Защищённый маршрут, доступный только с токеном """
    user = UserKeycloak(email_verified=False, groups=[], preferred_username="default", sub=settings.get_default_user)
    presentation_list = await db_work.get_my_preses(filter_dict=[{"field": PresentationRequest.user_id, "value": user.sub}],
                                                    sort=[Sort(desc=True, sort_value=PresentationResult.created_at)],
                                                    fields_output=["id", "request_id", "status", "theme"])
    presentation_list = [PresentationsRequestResponseCompleted(
        presentation_id=i.get("id"),
        request_id=i.get("request_id"),
        theme=i.get("theme"),
        status=i.get("status")
    ) for i in presentation_list]
    return MyPresentationsRequestList(username=user.preferred_username, presentation_list=presentation_list)


@router.post("/register")
async def register_user(data: RegisterRequest):
    """ Регистрация нового пользователя в Keycloak """
    try:
        await keycloak_client.create_user_in_keycloak(data.username, data.password)
        return {"message": "User created successfully", "user": data.username}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong during registration")

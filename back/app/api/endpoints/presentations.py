import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Form, status
from pydantic import ValidationError
from fastapi.encoders import jsonable_encoder
from typing import Union

from app.api.deps import keycloak_client, get_db_work, get_minio_client
from app.core.minio_client import MinioClient
from app.schemas.auth_schemas import UserKeycloak
from app.schemas.presentations_schema import (
    PresentationsRequestFile,
    PresentationsRequest, PresentationsRequestResponse, PresentationsResultPatch,
    PresentationsRequestResponseCompleted, PresentationsResultGet,
)
from app.core.postgres import DBWork
from app.models.models import (
    PresentationRequest as PresentationRequestModel, RequestStatus,
    PresentationResult as PresentationResultModel
)
from app.core.config import settings
from app.core.error_config import error_dict, ErrorName
from app.celery.celery_app import create_request as celery_create_request
from app.utils import files as file_utils

router = APIRouter()


def checker(data: str = Form(...)):
    try:
        return PresentationsRequest.model_validate_json(data)
    except ValidationError as e:
        raise HTTPException(
            detail=jsonable_encoder(e.errors()),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


@router.post("/request")
async def create_request(
        request_data: PresentationsRequest = Depends(checker),
        file: PresentationsRequestFile = Depends(),
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        s3_client: MinioClient = Depends(get_minio_client),
        db_work: DBWork = Depends(get_db_work)
):
    file = file.new_files[0] if len(file.new_files) > 0 else None
    presentation_request = PresentationRequestModel(
        id=uuid.uuid4(),
        user_id=user.sub,
        theme=request_data.theme,
        count_slides=request_data.count_slides,
        status=RequestStatus.PENDING
    )
    if file:
        file_path = await file_utils.upload_files(file, presentation_request.id, s3_client)
        presentation_request
    await db_work.create(presentation_request)
    celery_create_request.delay(request_id=presentation_request.id, theme=request_data.theme, user_id=user.sub)
    return PresentationsRequestResponse(
        request_id=presentation_request.id,
        status=presentation_request.status
    )


@router.get("/request/{request_id}")
async def get_request(
        request_id: uuid.UUID,
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
    request_obj: PresentationRequestModel = await db_work.get_one_obj(PresentationRequestModel, {'id': request_id})
    if not request_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(request_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)
    if request_obj.status != RequestStatus.COMPLETED:
        return PresentationsRequestResponse(
            request_id=request_obj.id,
            status=request_obj.status
        )
    else:
        presentation_obj: PresentationResultModel = await db_work.get_one_obj(PresentationResultModel, {'request_id': request_obj.id})
        return PresentationsRequestResponseCompleted(
            presentation_id=presentation_obj.id if presentation_obj else None,
            request_id=request_obj.id,
            status=request_obj.status
        )


# @router.get("/presentation/{presentation_id}")
# async def get_presentation(
#         presentation_id: uuid.UUID,
#         user: UserKeycloak = Depends(keycloak_client.get_current_user),
#         db_work: DBWork = Depends(get_db_work)
# ):
#     presentation_obj: PresentationResultModel = await db_work.get_one_obj(
#         PresentationResultModel,
#         {'id': presentation_id}
#     )
#     if not presentation_obj:
#         raise error_dict.get(ErrorName.DoesNotExist)
#     if settings.DEFAULT_ADMIN_GROUP not in user.groups:
#         if str(presentation_obj.user_id) != str(user.sub):
#             raise error_dict.get(ErrorName.Forbidden)
#     return PresentationsResultGet(
#         presentation_id=presentation_obj.id,
#         title=presentation_obj.title,
#         content=presentation_obj.content,
#         created_at=presentation_obj.created_at
#     )


# @router.patch("/presentation/{presentation_id}")
# async def update_presentation(
#         presentation_id: uuid.UUID,
#         presentation_data: PresentationsResultPatch,
#         user: UserKeycloak = Depends(keycloak_client.get_current_user),
#         db_work: DBWork = Depends(get_db_work)
# ):
#     presentation_obj: PresentationResultModel = await db_work.get_one_obj(
#         PresentationResultModel,
#         {'id': presentation_id}
#     )
#     if not presentation_obj:
#         raise error_dict.get(ErrorName.DoesNotExist)
#     if settings.DEFAULT_ADMIN_GROUP not in user.groups:
#         if str(presentation_obj.user_id) != str(user.sub):
#             raise error_dict.get(ErrorName.Forbidden)
#     presentation_obj.title = presentation_data.title
#     presentation_obj.content = presentation_data.content
#     presentation_obj.updated_at = datetime.datetime.utcnow()
#     await db_work.save_obj()


# @router.delete("/presentation/{presentation_id}")
# async def delete_presentation(
#         presentation_id: uuid.UUID,
#         user: UserKeycloak = Depends(keycloak_client.get_current_user),
#         db_work: DBWork = Depends(get_db_work)
# ):
#     presentation_obj: PresentationResultModel = await db_work.get_one_obj(
#         PresentationResultModel,
#         {'id': presentation_id}
#     )
#     if not presentation_obj:
#         raise error_dict.get(ErrorName.DoesNotExist)
#     if settings.DEFAULT_ADMIN_GROUP not in user.groups:
#         if str(presentation_obj.user_id) != str(user.sub):
#             raise error_dict.get(ErrorName.Forbidden)
#     await db_work.delete_obj(PresentationRequestModel, {'id': presentation_obj.request_id})
#     await db_work.delete_obj(PresentationHistoryModel, {'id': presentation_id})
#     await db_work.delete_obj(PresentationResultModel, {'id': presentation_id})
#     return {
#         "message": "Presentation deleted successfully"
#     }
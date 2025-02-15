import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Form, status
from pydantic import ValidationError
from fastapi.encoders import jsonable_encoder
from typing import Union, List

from app.api.deps import keycloak_client, get_db_work, get_minio_client
from app.core.minio_client import MinioClient
from app.schemas.auth_schemas import UserKeycloak
from app.schemas.presentations_schema import (
    PresentationsRequestFile,
    PresentationsRequest, PresentationsRequestResponse,
    PresentationsRequestResponseCompleted, PresentationsResultGet, Slide
)
from app.core.postgres import DBWork, Sort
from app.models.models import (
    PresentationRequest as PresentationRequestModel, RequestStatus,
    PresentationResult as PresentationResultModel, Slide as SlideModel
)
from app.core.config import settings
from app.core.error_config import error_dict, ErrorName
from app.celery.celery_app import create_request as celery_create_request
from app.utils import files as file_utils

router = APIRouter()

user_id_default = "a28a223c-61a3-4a4e-87cb-77cfdd979b85"

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
        files: PresentationsRequestFile = Depends(),
        s3_client: MinioClient = Depends(get_minio_client),
        db_work: DBWork = Depends(get_db_work)
):
    user: UserKeycloak(email_verified=False, groups=[], preferred_username="default", sub=user_id_default)
    files = files.new_files if len(files.new_files) > 0 else None
    presentation_request = PresentationRequestModel(
        id=uuid.uuid4(),
        user_id=user.sub,
        theme=request_data.theme,
        count_slides=request_data.count_slides,
        status=RequestStatus.PENDING
    )
    file_path_list = []
    if files:
        file_path_list = await file_utils.upload_files(files, presentation_request.id, s3_client)
    await db_work.create(presentation_request)
    celery_create_request.delay(request_id=presentation_request.id, theme=request_data.theme,
                                user_id=user.sub, num_slides=request_data.count_slides, files=file_path_list)
    return PresentationsRequestResponseCompleted(
        presentation_id=None,
        request_id=presentation_request.id,
        status=presentation_request.status,
        theme=presentation_request.theme
    )


@router.get("/request/{request_id}")
async def get_request(
        request_id: uuid.UUID,
        db_work: DBWork = Depends(get_db_work)
):
    user: UserKeycloak(email_verified=False, groups=[], preferred_username="default", sub=user_id_default)
    request_obj: PresentationRequestModel = await db_work.get_one_obj(PresentationRequestModel, {'id': request_id})
    if not request_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(request_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)
    if request_obj.status != RequestStatus.COMPLETED:
        return PresentationsRequestResponse(
            request_id=request_obj.id,
            status=request_obj.status,
            theme=request_obj.theme
        )
    else:
        presentation_obj: PresentationResultModel = await db_work.get_one_obj(PresentationResultModel, {'request_id': request_obj.id})
        return PresentationsRequestResponseCompleted(
            presentation_id=presentation_obj.id if presentation_obj else None,
            request_id=request_obj.id,
            status=request_obj.status,
            theme=request_obj.theme
        )


@router.get("/presentation/{presentation_id}")
async def get_presentation(
        presentation_id: uuid.UUID,
        db_work: DBWork = Depends(get_db_work)
):
    user: UserKeycloak(email_verified=False, groups=[], preferred_username="default", sub=user_id_default)
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    if not presentation_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(presentation_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)

    slides: List[SlideModel] = await db_work.get_objects(SlideModel,
                                       [{"field": SlideModel.request_id, "value": presentation_obj.request_id}],
                                       sort=[Sort(desc=False, sort_value=SlideModel.slide_num)])
    slides = [Slide(id=i.id, slide_number=i.slide_num, elements=i.elements) for i in slides]

    request = await db_work.get_one_obj(PresentationRequestModel,
                                        [{'field': PresentationResultModel.request_id, 'value': presentation_obj.request_id}])

    return PresentationsResultGet(
        presentation_id=presentation_obj.id,
        theme=presentation_obj.theme,
        status=request.status,
        request_id=presentation_obj.request_id,
        slides=slides
    )


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


@router.delete("/presentation/{presentation_id}")
async def delete_presentation(
        presentation_id: uuid.UUID,
        db_work: DBWork = Depends(get_db_work)
):
    user: UserKeycloak(email_verified=False, groups=[], preferred_username="default", sub=user_id_default)
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    if not presentation_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(presentation_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)
    await db_work.delete_obj(PresentationRequestModel, {'id': presentation_obj.request_id})
    await db_work.delete_obj(PresentationResultModel, {'id': presentation_id})
    await db_work.delete_obj(SlideModel, {'id': presentation_obj.request_id})
    return {
        "message": "Presentation deleted successfully"
    }
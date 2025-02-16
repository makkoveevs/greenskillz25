import datetime
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Form, status, Query
from pydantic import ValidationError
from fastapi.encoders import jsonable_encoder
from typing import Union, List

from starlette.responses import FileResponse, StreamingResponse

from app.api.deps import keycloak_client, get_db_work, get_minio_client
from app.celery.llm import update_slide
from app.core.minio_client import MinioClient
from app.schemas.auth_schemas import UserKeycloak
from app.schemas.presentations_schema import (
    PresentationsRequestFile,
    PresentationsRequest, PresentationsRequestResponse,
    PresentationsRequestResponseCompleted, PresentationsResultGet, Slide, PresentationsResultPatch,
    PresentationsResultSlideUpdate
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
from app.celery.pptx import get_pres

router = APIRouter()

user_id_default = settings.get_default_user

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
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        s3_client: MinioClient = Depends(get_minio_client),
        db_work: DBWork = Depends(get_db_work)
):
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
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
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


@router.patch("/presentation/{presentation_id}")
async def update_presentation(
        presentation_id: uuid.UUID,
        presentation_data: PresentationsResultPatch,
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    if not presentation_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(presentation_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)
    slide_ids = [i.id for i in presentation_data.slides]
    db_slides = await db_work.select_only_fields(SlideModel, [{'field': SlideModel.id, 'value': slide_ids}], ['id'], False)
    db_slides = set([i['id'] for i in db_slides])
    new_slides = set(slide_ids) - db_slides
    for slide in presentation_data.slides:
        if slide.id in new_slides:
            header = [i.get('content', '') for i in slide.elements if i.get("text_type", '') == 'header']
            header = header[0] if header else ''
            x = SlideModel(id=slide.id, slide_num=slide.slide_number,
                            slide_header=header, elements=slide.elements, request_id=presentation_obj.request_id)
            await db_work.create(x)
        else:
            header = [i.get('content', '') for i in slide.elements if i.get("text_type", '') == 'header']
            header = header[0] if header else ''
            await db_work.update_obj(SlideModel, [{'field': SlideModel.id, 'value': slide.id}],
                                     {"slide_num": slide.slide_number, "slide_header": header,
                                      "elements": slide.elements})


@router.delete("/request/{request_id}")
async def delete_presentation(
        request_id: uuid.UUID,
        user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
    reques_obj: PresentationRequestModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': request_id}
    )
    if not reques_obj:
        raise error_dict.get(ErrorName.DoesNotExist)
    if settings.DEFAULT_ADMIN_GROUP not in user.groups:
        if str(reques_obj.user_id) != str(user.sub):
            raise error_dict.get(ErrorName.Forbidden)
    await db_work.delete_obj(PresentationRequestModel, {'id': reques_obj.id})
    await db_work.delete_obj(PresentationResultModel, {'request_id': request_id})
    await db_work.delete_obj(SlideModel, {'id': reques_obj.id})
    return {
        "message": "Presentation deleted successfully"
    }


@router.get("/download/{presentation_id}")
async def download_presentation(
        presentation_id: uuid.UUID,
        design: int = Query(default=1),
        # user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    # if not presentation_obj:
    #     raise error_dict.get(ErrorName.DoesNotExist)
    # if settings.DEFAULT_ADMIN_GROUP not in user.groups:
    #     if str(presentation_obj.user_id) != str(user.sub):
    #         raise error_dict.get(ErrorName.Forbidden)
    slides = await db_work.get_objects(SlideModel, [{'field': SlideModel.request_id, 'value': presentation_obj.request_id}],
                                       sort=[Sort(desc=False, sort_value=SlideModel.slide_num)])
    result_slides = {'slides': []}
    for slide in slides:
        result_slides['slides'].append({"elements": slide.elements, "id": slide.id, "slide_number": slide.slide_num})
    get_pres(result_slides, presentation_id, design)

    return FileResponse(
        f'{presentation_id}.pptx',
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={'Content-Disposition': f'attachment; filename="{presentation_id}.pptx"',
                 "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation"})


@router.get("/download_minio/{presentation_id}")
async def download_presentation(
        presentation_id: uuid.UUID,
        design: int = Query(default=1),
        # user: UserKeycloak = Depends(keycloak_client.get_current_user),
        s3_client: MinioClient = Depends(get_minio_client),
        db_work: DBWork = Depends(get_db_work),

):
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    # if not presentation_obj:
    #     raise error_dict.get(ErrorName.DoesNotExist)
    # if settings.DEFAULT_ADMIN_GROUP not in user.groups:
    #     if str(presentation_obj.user_id) != str(user.sub):
    #         raise error_dict.get(ErrorName.Forbidden)
    slides = await db_work.get_objects(SlideModel, [{'field': SlideModel.request_id, 'value': presentation_obj.request_id}],
                                       sort=[Sort(desc=False, sort_value=SlideModel.slide_num)])
    result_slides = {'slides': []}
    for slide in slides:
        result_slides['slides'].append({"elements": slide.elements, "id": slide.id, "slide_number": slide.slide_num})

    from app.celery.pptx import get_pres1
    get_pres1(result_slides, presentation_id, design)

    try:
        from app.utils.files import upload_files
        upload_files([f"{presentation_id}.pptx"], presentation_id, s3_client)
    except Exception as Err:
        print(Err)

    try:
        from minio import Minio
        client = Minio(
            settings.MINIO_ENDPOINT_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY
        )
        result = client.put_object(
            bucket_name='delta',
            object_name='1.pptx',
            data=open('1.pptx', 'rb'),
            length=1024 * 1024 # размер файла в байтах
        )
    except Exception as Err:
        print(Err)
        
    return FileResponse(
        '1.pptx',
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={'Content-Disposition': 'attachment; filename=1.pptx',
                 "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation"})


@router.patch("/regex/{presentation_id}")
async def update_presentation(
        presentation_id: uuid.UUID,
        presentation_data: PresentationsResultSlideUpdate,
        # user: UserKeycloak = Depends(keycloak_client.get_current_user),
        db_work: DBWork = Depends(get_db_work)
):
    presentation_obj: PresentationResultModel = await db_work.get_one_obj(
        PresentationResultModel,
        {'id': presentation_id}
    )
    # if not presentation_obj:
    #     raise error_dict.get(ErrorName.DoesNotExist)
    # if settings.DEFAULT_ADMIN_GROUP not in user.groups:
    #     if str(presentation_obj.user_id) != str(user.sub):
    #         raise error_dict.get(ErrorName.Forbidden)
    slide = None
    slide_header_block = {}
    for i in presentation_data.slides:
        if i.slide_number == presentation_data.slide_num:
            slide_id = i.id
            slide = i.elements
            text_current = []
            slide_header = ''
            for j in slide:
                if j.get('text_type', '') == 'regular':
                    text_current.append(j.get('content', ''))
                if j.get('text_type', '') == 'header':
                    slide_header = j.get('content', '')
                    slide_header_block = j
            break
    else:
        return
    text_current = ' '.join(text_current)
    new_text = presentation_data.text
    print(presentation_obj.theme)
    print(slide_header)
    print(text_current)
    print(new_text)
    content = update_slide(theme=presentation_obj.theme, header=slide_header, text=text_current, added_text=new_text)
    if slide_header_block:
        slide = [slide_header_block, {
                "id": str(uuid.uuid4()),
                "text_type": "regular",
                "alignment": "left",
                "style": "regular",
                "size": 16,
                "content": content,
                "w": 0.8,
                "h": 0.7,
                "x": 0.2,
                "y": 0.3,
            }]
    else:
        slide = [
            {
                "id": str(uuid.uuid4()),
                "text_type": "regular",
                "alignment": "left",
                "style": "regular",
                "size": 16,
                "content": content,
                "w": 0.8,
                "h": 0.7,
                "x": 0.2,
                "y": 0.3,
            }
        ]
    await db_work.update_obj(SlideModel, [{'field': SlideModel.id, 'value': slide_id}], {"elements": slide})

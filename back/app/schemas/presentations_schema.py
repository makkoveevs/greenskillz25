import datetime

from pydantic import BaseModel
import uuid
from typing import Optional, Union, Any, List
from fastapi import UploadFile, File

from app.models.models import RequestStatus


class PresentationsRequest(BaseModel):
    theme: str
    count_slides: Optional[int] = 5
    template_id: Optional[uuid.UUID] = None


class PresentationsRequestFile(BaseModel):
    new_files: List[UploadFile] = File(default=[])


class PresentationsRequestResponse(BaseModel):
    request_id: Optional[uuid.UUID] = None
    theme: Optional[str] = None
    status: Optional[RequestStatus] = None


class PresentationsRequestResponseCompleted(PresentationsRequestResponse):
    presentation_id: Union[uuid.UUID, None]


class MyPresentationsRequestList(BaseModel):
    presentation_list: List[PresentationsRequestResponseCompleted]


class PresentationsResult(BaseModel):
    presentation_id: uuid.UUID
    title: Union[str, None]


class PresentationsResultGet(PresentationsResult):
    presentation_id: uuid.UUID
    created_at: datetime.datetime


class PresentationsResultPatch(PresentationsResult):
    pass


class Slide(BaseModel):
    title: str


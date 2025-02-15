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
    username: str
    presentation_list: List[PresentationsRequestResponseCompleted]


class Slide(BaseModel):
    id: uuid.UUID
    slide_number: int
    elements: Union[list, dict]


class PresentationsResultGet(BaseModel):
    presentation_id: uuid.UUID
    theme: Union[str, None]
    status: str
    request_id: uuid.UUID
    slides: List[Slide]

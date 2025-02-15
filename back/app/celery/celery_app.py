import datetime
import time
import uuid

from celery import Celery

from app.models.models import PresentationRequest, RequestStatus, PresentationResult
from app.celery.posrgres_sync import SyncDBWork
from app.core.config import settings


celery = Celery("secureblogs")
celery.conf.broker_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"


@celery.task(name="create_request")
def create_request(request_id: uuid.UUID, theme: str, user_id: uuid.UUID):
    # generate temp key and encrypt content
    db_work = SyncDBWork()
    db_work.update_obj(PresentationRequest, [{'field': PresentationRequest.id, 'value': request_id}],
                       {"status": RequestStatus.PROCESSING, "updated_at": datetime.datetime.utcnow()})
    print('sleep')
    time.sleep(10)
    presentation_obj = PresentationResult(id=uuid.uuid4(), theme=theme, request_id=request_id, user_id=user_id)
    db_work.create_obj(presentation_obj)
    print("wake up!")
    db_work.update_obj(PresentationRequest, [{'field': PresentationRequest.id, 'value': request_id}],
                       {"status": RequestStatus.COMPLETED, "updated_at": datetime.datetime.utcnow()})

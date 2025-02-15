import datetime
import os
import time
import uuid
from typing import List

from celery import Celery

from app.models.models import PresentationRequest, RequestStatus, PresentationResult, Slide
from app.celery.posrgres_sync import SyncDBWork, Sort
from app.core.config import settings
from app.celery.llm import get_presentation_content_structured, get_slide
from app.celery.rag import parse_file_in_document, get_text_from_document, create_vector_store, get_rag_context
from app.celery.minio_sync import download_file

from langchain_ollama import OllamaEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore


celery = Celery("secureblogs")
celery.conf.broker_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"


@celery.task(name="create_request")
def create_request(request_id: uuid.UUID, theme: str, user_id: uuid.UUID,
                   num_slides: int, files: List[str]):
    db_work = SyncDBWork()
    db_work.update_obj(PresentationRequest, [{'field': PresentationRequest.id, 'value': request_id}],
                       {"status": RequestStatus.PROCESSING, "updated_at": datetime.datetime.utcnow()})
    text_file = ''
    doc_list = []
    if files:

        for file in files:
            download_file(file, f'/app/{file.split("/")[-1]}')
            with open('app/{file.split("/")[-1]}', 'r') as file:
                data = file.read()
            doc = parse_file_in_document(data)
            text_file += get_text_from_document(doc)
            doc_list.append(doc)

        embeddings = OllamaEmbeddings(model="bge-m3")
        vector_store = InMemoryVectorStore(embeddings)
        for doc in doc_list:
            vector_store = create_vector_store(vector_store=vector_store, document=doc)

    presentation_content = get_presentation_content_structured(theme=theme,
                                                                num_slides=num_slides, content=text_file)
    if not presentation_content:
        presentation_content = get_presentation_content_structured(theme=theme,
                                                                num_slides=num_slides, content="")

    if presentation_content and isinstance(presentation_content, dict) and len(presentation_content.get('slides', {})):
        count = 3
        while count <= num_slides + 2:
            slide = Slide(id=uuid.uuid4(), slide_num=count,
                          slide_header=presentation_content.get('slides', {}).get(f'slide_{count-2}', ''),
                          elements={}, request_id=request_id)
            db_work.create_obj(slide)
            count += 1
        presentation_obj = PresentationResult(id=uuid.uuid4(), theme=theme, request_id=request_id, user_id=user_id)
        db_work.create_obj(presentation_obj)
    else:
        db_work.update_obj(PresentationRequest, [{'field': PresentationRequest.id, 'value': request_id}],
                           {"status": RequestStatus.FAILED, "updated_at": datetime.datetime.utcnow()})
    return

    slides: List[Slide] = db_work.get_objects(Slide, [{"field": Slide.request_id, "value": request_id}],
                                 [Sort(desc=False, sort_value=Slide.created_at)])
    history = ""

    slide_1 = Slide(id=uuid.uuid4(), slide_num=1, slide_header=theme, elements=[
        {
            "id": str(uuid.uuid4()),
            "text_type": "header",  # regular, header, list
            "alignment": "center",  # left, right, center, justify
            "style": "bold",  # regular, bold, italic
            "size": 48,
            "content": theme,
            "w": 0,
            "h": 0,
            "x": 0.1,
            "y": 0.1,
        }
    ],
                    request_id=request_id)
    db_work.create_obj(slide_1)
    elements_2 = []
    for n, i in enumerate(slides, 0):
        elements_2.append({
            "id": str(uuid.uuid4()),
            "text_type": "regular",  # regular, header, list
            "alignment": "center",  # left, right, center, justify
            "style": "bold",  # regular, bold, italic
            "size": 48,
            "content": i.slide_header,
            "w": 0,
            "h": 0,
            "x": 0.1,
            "y": 0.95 if 0.3+n*0.6/len(slides) >= 1 else 0.3+n*0.6/len(slides),
        })

    elements_2.insert(0, {
            "id": str(uuid.uuid4()),
            "text_type": "header",  # regular, header, list
            "alignment": "center",  # left, right, center, justify
            "style": "bold",  # regular, bold, italic
            "size": 48,
            "content": "Оглавление",
            "w": 0,
            "h": 0,
            "x": 0.1,
            "y": 0.1,
        })
    slide_2 = Slide(id=uuid.uuid4(), slide_num=2, slide_header=theme, elements=elements_2,
                    request_id=request_id)
    db_work.create_obj(slide_2)

    for slide in slides:
        content = ''
        if files:
            content = get_rag_context(vector_store, slide.slide_header)
        print(f'------------{slide.slide_header}')
        slide_content = get_slide(theme=theme, header=slide.slide_header, history=history, context=content)
        slide_content = slide_content if slide_content else "pass"
        elements = [
            {
                "id": str(uuid.uuid4()),
              "text_type": "header", # regular, header, list
              "alignment": "center", # left, right, center, justify
              "style": "bold", # regular, bold, italic
              "size": 48,
              "content": slide.slide_header,
                "w": 0,
                "h": 0,
                "x": 0.1,
                "y": 0.1,
            },
            {
                "id": str(uuid.uuid4()),
              "text_type": "regular",
              "alignment": "left",
              "style": "regular",
              "size": 24,
              "content": slide_content,
                "w": 0,
                "h": 0,
                "x": 0.1,
                "y": 0.3,
            }
        ]
        slide.elements = elements
        history += slide_content
        db_work.update_obj(Slide, [{'field': Slide.id, 'value': slide.id}],
                           {'slide_header': slide.slide_header, "elements": elements, "updated_at": datetime.datetime.utcnow()})
    db_work.update_obj(PresentationRequest, [{'field': PresentationRequest.id, 'value': request_id}],
                       {"status": RequestStatus.COMPLETED, "updated_at": datetime.datetime.utcnow()})




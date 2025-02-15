import enum
import uuid
from datetime import datetime

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey, Column, text
from typing import Annotated


Base = declarative_base()


pk_uuid = Annotated[uuid.UUID, mapped_column(primary_key=True, default=uuid.uuid4)]
created_at = Annotated[datetime, mapped_column(server_default=text("CURRENT_TIMESTAMP"))]
updated_at = Annotated[datetime, mapped_column(server_default=text("CURRENT_TIMESTAMP"), server_onupdate=text("CURRENT_TIMESTAMP"))]


class RequestStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PresentationRequest(Base):
    """
    запросы на презентацию
    """
    __tablename__ = "presentation_request"
    id: Mapped[pk_uuid]
    user_id: Mapped[uuid.UUID]
    theme: Mapped[str] = mapped_column(nullable=False)
    # template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("templates.id", ondelete="SET NULL"),
    #                                               nullable=True)
    status: Mapped[RequestStatus] = mapped_column(nullable=False)
    count_slides: Mapped[int]
    created_at: Mapped[created_at]
    updated_at: Mapped[updated_at]


class Slide(Base):
    __tablename__ = "slides"

    id: Mapped[pk_uuid]
    slide_num: Mapped[int]
    slide_header: Mapped[str]
    elements = Column(JSONB, nullable=True)
    request_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("presentation_request.id", ondelete="CASCADE"),
                                                  nullable=False)
    created_at: Mapped[created_at]
    updated_at: Mapped[updated_at]


class PresentationResult(Base):

    __tablename__ = "presentation_result"
    id: Mapped[pk_uuid]
    theme: Mapped[str] = mapped_column(nullable=True)
    request_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("presentation_request.id", ondelete="CASCADE"),
                                                  nullable=False, unique=True)
    user_id: Mapped[uuid.UUID]
    created_at: Mapped[created_at]
    updated_at: Mapped[updated_at]


# class PresentationHistory(Base):
#
#     __tablename__ = "presentation_history"
#     id: Mapped[pk_uuid]
#     presentation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("presentation_result.id", ondelete="CASCADE"), nullable=False)
#     user_id: Mapped[uuid.UUID]
#     changes = Column(JSONB, nullable=True)
#     created_at: Mapped[created_at]

#
class Image(Base):
    __tablename__ = "images"
    id: Mapped[pk_uuid]
    image_url: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[created_at]


# class Template(Base):
#     __tablename__ = "templates"
#     id: Mapped[pk_uuid]
#     name: Mapped[str] = mapped_column(nullable=False)
#     html_content: Mapped[str]
#     updated_at: Mapped[updated_at]
#     created_at: Mapped[created_at]

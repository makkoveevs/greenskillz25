from typing import Union, Any, List

from pydantic import BaseModel
from sqlalchemy import update, create_engine
from sqlalchemy.sql import and_, select
from sqlalchemy.orm import sessionmaker

from app.models.models import PresentationRequest, RequestStatus
from app.core.config import settings

sync_engine = create_engine(settings.pg_celery_conn, echo=True)
SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
)

class Sort(BaseModel):
    desc: bool
    sort_value: Any


class SyncDBWork:
    @staticmethod
    def create_filter(model, dict_filters: Union[dict, list]) -> list:
        filters = []
        if isinstance(dict_filters, list):
            for item in dict_filters:
                if isinstance(item['value'], list):
                    filters.append(item['field'].in_(item['value']))
                else:
                    filters.append(item['field'] == item['value'])
            return filters
        for column_name, column_value in dict_filters.items():
            if isinstance(column_value, list):
                filters.append(getattr(model, column_name).in_(column_value))
            else:
                filters.append(getattr(model, column_name) == column_value)
        return filters

    @staticmethod
    def sort_query(query, sort_list: List[Sort]):
        for sort in sort_list:
            if sort.desc:
                query = query.order_by(sort.sort_value.desc())
            else:
                query = query.order_by(sort.sort_value)
        return query

    def update_obj(self, model, filter_dict, values):
        with SyncSessionLocal() as db:
            # update post instance
            query = update(model)
            if filter_dict:
                filters = self.create_filter(model, filter_dict)
            query = query.filter(and_(*filters))
            query = query.values(**values)
            db.execute(query)
            db.commit()
            db.close()

    def create_obj(self, obj):
        with SyncSessionLocal() as db:
            db.add(obj)
            db.commit()
            db.close()

    def get_objects(self, model, filter_dict, sort):
        with SyncSessionLocal() as db:
            query = select(model)

            filters = []
            if filter_dict:
                filters = self.create_filter(model, filter_dict)
            query = query.filter(and_(*filters))
            if sort:
                query = self.sort_query(query, sort)
            x = (db.execute(query)).scalars().all()
            db.commit()
            db.close()
            return x
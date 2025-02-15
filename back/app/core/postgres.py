from typing import List, Union, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, selectinload, aliased
from sqlalchemy.sql import and_, func, select, delete, update, distinct, or_, not_, case
from sqlalchemy import insert, text
from pydantic import BaseModel
from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.core.error_config import ErrorName
from app.models.models import PresentationResult, PresentationRequest

engine = create_async_engine(settings.pg_conn, echo=True, future=True)

async_session_local = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# Функция для получения сессии БД
async def get_db():
    async with async_session_local() as session:
        yield session

class Sort(BaseModel):
    desc: bool
    sort_value: Any


class BaseDBWork:
    def __init__(self, session):
        self.session = session

    @staticmethod
    async def create_filter(model, dict_filters: Union[dict, list]) -> list:
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
    async def create_serach_filter(filters: List, dict_filters: List):
        for item in dict_filters:
            filters.append(item['field'].ilike(f'%{item["value"]}%'))
        return filters

    @staticmethod
    async def get_result_dict(result, fields_output: List):
        result_list = []
        for i in result:
            result_list.append(dict((fields_output[n], j) for n, j in enumerate(i, 0)))
        return result_list

    @staticmethod
    async def select_query(model=None, fields_output: list = None, scalars_option: bool = True):
        if scalars_option and model:
            query = select(model)
            return query
        elif fields_output:
            query = select(*fields_output)
            return query

    @staticmethod
    async def sort_query(query, sort_list: List[Sort]):
        for sort in sort_list:
            if sort.desc:
                query = query.order_by(sort.sort_value.desc())
            else:
                query = query.order_by(sort.sort_value)
        return query

    async def get_or_create(self, model, filter_dict: dict, data_for_create: dict):
        obj = await self.get_one_obj(model, filter_dict)
        created = False
        if obj is None:
            obj = model(**data_for_create)
            self.session.add(obj)
            await self.session.commit()
            created = True
        return obj, created

    async def create(self, model):
        self.session.add(model)
        await self.session.commit()

    async def create_bulk(self, models):
        self.session.add_all(models)
        await self.session.commit()

    async def create_or_update_bulk(self, model, data_for_insert: List[Any], excluded_column_names: List[str]):
        """Массовое создание или обновление данных"""
        if not isinstance(data_for_insert, (list, tuple)):
            return
        for elem in data_for_insert:
            if not isinstance(elem, model):
                return
        data_for_insert_ = []
        for elem in data_for_insert:
            data_ = elem.__dict__
            if "_sa_instance_state" in data_:
                del data_["_sa_instance_state"]
            data_for_insert_.append(data_)
        stmt = insert(model.__table__).values(data_for_insert_)

        # Указываем, какие колонки обновлять при конфликте
        update_columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in model.__table__.columns
            if col.name not in excluded_column_names
        }
        stmt = stmt.on_conflict_do_update(
            index_elements=excluded_column_names,  # Поля, по которым определяем конфликт
            set_=update_columns
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def create_bulk_table(self, model, values, commit: bool = True):
        """Cоздание нескольких записей в таблице, отличается от create_bulk
        тем что там работа с объектами sqlalchemy а тут с таблицей"""
        insert_statement = insert(model).values(values)
        await self.session.execute(insert_statement)
        if commit:
            await self.session.commit()
        else:
            await self.session.flush()

    async def get_one_obj(self, model, filter_dict: dict, attr_for_load: Union[List, str] = None):
        query = select(model)
        filters = await self.create_filter(model, filter_dict)
        query = query.filter(and_(*filters))
        if attr_for_load:
            if isinstance(attr_for_load, list):
                query = query.options(*[selectinload(getattr(model, i)) for i in attr_for_load])
            else:
                query = query.options(selectinload(getattr(model, attr_for_load)))
        result = await self.session.execute(query)
        return result.scalar()

    async def get_objects(self, model, filter_dict: Union[dict, list], search: List = None, sort: List[Sort] = None):
        query = select(model)

        filters = []
        if filter_dict:
            filters = await self.create_filter(model, filter_dict)
        if search:
            filters = await self.create_serach_filter(filters, search)
        query = query.filter(and_(*filters))
        if sort:
            query = await self.sort_query(query, sort)
        return (await self.session.execute(query)).scalars().all()

    async def select_only_fields(
            self,
            model,
            dict_filters: dict,
            fields_output: List,
            scalars_option: bool = True,
            sort: List[Sort] = None
    ):
        query = await self.select_query(
            fields_output=[getattr(model, i) for i in fields_output],
            scalars_option=scalars_option
        )
        filters = await self.create_filter(model, dict_filters)
        query = query.filter(and_(*filters))
        if sort:
            query = await self.sort_query(query, sort)
        result = await self.session.execute(query)

        if scalars_option:
            return result.scalars().all()
        else:
            return await self.get_result_dict(result, fields_output)

    async def get_count_by_filters(self, model, dict_filters: dict) -> int:
        query = select(func.count())
        filters = await self.create_filter(model, dict_filters)
        query = query.where(*filters)
        result = await self.session.execute(query)
        return result.scalar()

    async def delete_obj(self, model, filter_dict: dict) -> None:
        conditions = await self.create_filter(model=model, dict_filters=filter_dict)
        query = delete(model).where(and_(*conditions))
        await self.session.execute(query)
        await self.session.commit()

    async def update_obj(self, model, where: dict, for_set: dict) -> Union[None, ErrorName]:
        obj = await self.get_one_obj(model, where)
        if not obj:
            return ErrorName.DoesNotExist
        for attr, new_value in for_set.items():
            setattr(obj, attr, new_value)
        await self.session.commit()

    # async def update_objects(self, model, filter_dict: dict, update_dict: dict) -> Union[None, ErrorName]:
    #     query = update(model)
    #     filters = await self.create_filter(model, filter_dict)
    #     query = query.filter(and_(*filters))
    #     query = query.values(**update_dict)
    #     await self.session.execute(query)
    #     await self.session.commit()

    async def save_obj(self):
        await self.session.commit()

    async def bulk_save_obj(self, data: list):
        """Массовое обновление записей в БД"""
        try:
            for item in data:
                await self.session.merge(item)
            await self.session.commit()
        except Exception as e:
            await self.session.rollback()
            raise Exception(f"Ошибка при массовом upsert в базу данных: {e}")


class DBWork(BaseDBWork):
    async def get_my_preses(self, filter_dict, sort, fields_output):
        query = select(PresentationResult.id, PresentationRequest.id.label('request_id'),
                       PresentationRequest.status, PresentationRequest.theme).select_from(PresentationRequest)
        query = query.outerjoin(PresentationResult, PresentationRequest.id == PresentationResult.request_id)
        if filter_dict:
            filters = await self.create_filter(PresentationResult, filter_dict)
            query = query.filter(and_(*filters))
        if sort:
            query = await self.sort_query(query, sort)

        result = await self.session.execute(query)
        return await self.get_result_dict(result, fields_output)


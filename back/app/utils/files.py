import re

import json
import math
import uuid
from aiormq import AMQPError
from collections import defaultdict
from copy import copy
from io import BytesIO
from loguru import logger
from miniopy_async import S3Error
from sqlalchemy.exc import SQLAlchemyError
from tqdm.asyncio import tqdm_asyncio
from typing import Any, List, Union


async def upload_files(file, request_id, s3_client):
    tasks = []
    file_type = file.filename.split(".")[-1]
    file.filename = file.filename[: -len(file_type)]
    file.filename = file.filename + "." + file_type
    file_path = f"/request/{request_id}/source/{file.filename}"
    file_data = BytesIO()
    file.file.seek(0)
    content = await file.read()
    file_data.write(content)
    file_data.seek(0)

    task = s3_client.create_file(
        file_path, file_data.read()
    )
    tasks.append(task)

    await tqdm_asyncio.gather(*tasks, desc="Идёт загрузка файлов в minio")
    return file_path

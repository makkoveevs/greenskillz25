FROM python:3.11

ARG DIR_NAME
ENV DIR_NAME $DIR_NAME
RUN echo $DIR_NAME

ARG APP_FOLDER=/app


ENV PYTHONPATH="${APP_FOLDER}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Europe/Moscow


WORKDIR /app

COPY ${DIR_NAME}/requirements.txt requirements.txt

RUN apt update &&  apt clean && rm -rf /var/lib/apt/lists/*  && pip install --no-cache-dir --upgrade -r requirements.txt

COPY ${DIR_NAME}/. .
COPY . .

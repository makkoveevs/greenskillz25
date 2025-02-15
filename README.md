# greenskillz25


Запуск сервисов:
docker-compose up -d --build --force-recreate

Затем, необходимо зайти в контейнер ollama:
docker exec -it ollama bash

Загрузить модель:
ollama run qwen2.5:14b


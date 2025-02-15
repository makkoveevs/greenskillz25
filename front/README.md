1. Билд

- npm run build

2. Сборка контейнера

- docker build -t front .
- docker save --output ./front.tar front

3. Развертывание на сервере

- docker load -i путь\до\front.tar

4. При развёртывании на сервер положить .env с переменными
   KC_AUTH_SERVER=http://localhost:8080
   API=http://localhost:8081

где KC_AUTH_SERVER - внешний урл для кейклока,
API - урл, где развернут бэк

5. запуск контейнера (указана локальная строка запуска с хардкодом переменных)

- docker run -e KC_AUTH_SERVER=http://localhost:8080 -e API=http://localhost:8081 -p 80:80 front

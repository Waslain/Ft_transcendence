# Multiplayer Web Pong game built with Django

This project is a web application built using Django 5.1. It includes WebSocket support via Django Channels and features multiple apps such as `chat`, `pong`, `users`, `stats`, and `matchhistory`. The application is containerized using Docker and includes an Nginx reverse proxy.

## Features

- **Pong game**: Real-time multiplayer pong game.
- **Real-time Communication**: WebSocket support for real-time features like chat and pong.
- **User Management**: Custom user authentication and token-based authentication.
- **Statistics Tracking**: Collect and display user and game statistics.
- **Friend Management**: Add, block, and manage friends.
- **Responsive Frontend**: Interactive UI built with JavaScript and integrated with Django backend.

## Project Structure

```
srcs/
    django/
        django_app/
            chat/
            pong/
            users/
            stats/
            matchhistory/
        Dockerfile
        tools/
            requirements.txt
    nginx/
        conf/
        content/
            static/
docker-compose.yml
```

## Prerequisites
- Docker and Docker Compose
- srcs/django/tools/requirements.txt

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Copy the `.env.example` file to `.env` and configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

4. Apply database migrations:
   ```bash
   docker exec -it django_app python manage.py migrate
   ```

5. Access the application at `http://localhost`.

## API Endpoints

- **Chat**: `/chat/`
- **Users**: `/users/`
- **Stats**: `/stats/`
- **Admin Panel**: `/admin/`

The application uses Django Channels for WebSocket support. The ASGI application is defined in `srcs/django/django_app/django_app/asgi.py`.

## Middleware

Custom middleware includes:
- `TokenAuthMiddleware` for WebSocket authentication.
- `UserActivityMiddleware` for tracking user activity.

The frontend is located in `srcs/nginx/content/` and includes:
- JavaScript views: `static/js/`

## Acknowledgments
- [Django](https://www.djangoproject.com/)
- [Django Channels](https://channels.readthedocs.io/)
- [Nginx](https://www.nginx.com/)
- [Docker](https://www.docker.com/)
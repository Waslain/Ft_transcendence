#!/bin/bash

echo "Apply database migrations"

python manage.py migrate

echo "Starting server with Daphne"
daphne -b 0.0.0.0 -p 8000 django_app.asgi:application
FROM alpine:latest

RUN apk update && apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    libffi-dev

RUN mkdir -p /app

COPY ./tools/requirements.txt /app

RUN python3 -m venv .venv
RUN .venv/bin/pip install -r /app/requirements.txt

COPY ./tools/run_server.sh /app
COPY ./django_app /app

RUN chmod +x /app/run_server.sh

WORKDIR /app

EXPOSE 8000

ENTRYPOINT ["sh", "./run_server.sh"]
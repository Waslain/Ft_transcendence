FROM python:3.12-slim AS builder

RUN mkdir /app
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_ROOT_USER_ACTION=ignore

COPY tools/requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim

RUN groupadd -r -g 1000 django && useradd -r -g django -u 1000 django
RUN mkdir /app && chown django:django /app
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_ROOT_USER_ACTION=ignore

COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin /usr/local/bin/

COPY script/docker-entry.sh /docker-entry.sh
RUN chmod +x /docker-entry.sh && chown django:django /docker-entry.sh

RUN mkdir -p -m 777 /media

USER django

ENTRYPOINT [ "/docker-entry.sh" ]

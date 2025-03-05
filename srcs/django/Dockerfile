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

RUN useradd -m -r appuser && \
	mkdir /app && \
	chown -R appuser /app

COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib//python3.12/site-packages/
COPY --from=builder /usr/local/bin /usr/local/bin/

WORKDIR /app

COPY --chown=appuser:appuser django_app/ .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_ROOT_USER_ACTION=ignore

USER appuser

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "django_app.asgi:application"]

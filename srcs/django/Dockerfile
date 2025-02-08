FROM python:3.13-slim AS builder

RUN mkdir /app
RUN mkdir -p srcs/django/django_app/static_files
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY tools/requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.13-slim

# Create non-root user with UID 4242 (same as nginx)
RUN useradd -m -r appuser -u 4242 && \
	mkdir /app && \
	chown -R appuser /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin /usr/local/bin/

WORKDIR /app

# Copy application code and set ownership
COPY --chown=appuser:appuser django_app/ .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "django_app.asgi:application"]

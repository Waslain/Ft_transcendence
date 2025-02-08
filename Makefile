COMPOSE_FILE = ./docker-compose.yml
DOCKER = docker compose -f $(COMPOSE_FILE)

all: run

# Builds and starts everything
run:
	$(DOCKER) up --build
#	$(DOCKER) exec django python manage.py migrate --noinput

# Database management
# Usage: make makemigrations without restart the containers

# Creates migration files when you change models
makemigrations:
	$(DOCKER) exec django python manage.py makemigrations
# Apply migrations to the database
migrate:
	$(DOCKER) exec django python manage.py migrate

# Combined target for full database update
db-update: makemigrations migrate

# Stop services only
stop:
	$(DOCKER) stop

# Remove all containers and volumes
clean:
	$(DOCKER) down --volumes

# Remove all containers, images, volumes, networks, and prune unused data
fclean:
	@docker system prune -af --volumes
	@rm -rf /var/lib/docker/volumes/srcs_postgres_data

# Full
re: fclean all

# View all logs (with option to follow)
logs:
	$(DOCKER) logs

# Separate log targets for each service
logs-nginx:
	$(DOCKER) logs -f nginx

logs-django:
	$(DOCKER) logs -f django

logs-db:
	$(DOCKER) logs -f db

# Show running containers		
ps:
	$(DOCKER) ps

setup-dev:
	python -m venv venv
	. venv/bin/activate && pip install -r srcs/django/tools/requirements.txt

run-dev:
	. venv/bin/activate && python srcs/django/django_app/manage.py runserver

run-dev-docker:
	$(DOCKER) up --build -d
	@echo "🚀 Development server running with hot-reload enabled"
	@echo "📝 You can now edit your code and see changes immediately"
	@echo "🔍 View logs with: docker compose logs -f"


# Help target
help:
	@echo "Available targets:"
	@echo "  all        	: Start services"
	@echo "  run      		: Build images"
	@echo "  stop       	: Stop services"
	@echo "  logs       	: View all logs"
	@echo "  logs-nginx 	: View Nginx logs"
	@echo "  logs-django 	: View django logs"
	@echo "  logs-db    	: View Postgresql logs"
	@echo "  ps         	: Show containers"
	@echo "  clean      	: Remove containers"
	@echo "  fclean     	: Full cleanup"
	@echo "  re         	: Rebuild all"

.PHONY: all run stop clean fclean re logs logs-nginx logs-django logs-db ps help

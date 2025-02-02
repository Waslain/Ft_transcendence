COMPOSE_FILE = ./docker-compose.yml
DOCKER = docker compose -f $(COMPOSE_FILE)

all: run

run:
	$(DOCKER) up --build

stop:
	$(DOCKER) down


# View all logs (with option to follow)
logs:
	$(DOCKER) logs

# Separate log targets for each service
logs-nginx:
	$(DOCKER) logs -f nginx

logs-django:
	$(DOCKER) logs -f django

logs-db:
	$(DOCKER) logs -f postgresql


# Show running containers		
ps:
	$(DOCKER) ps

# Remove all containers, images, volumes, networks, and prune unused data
clean: stop
	@-docker stop `docker ps -qa` 2>/dev/null || true
	@-docker rm `docker ps -qa` 2>/dev/null || true
	@-docker image rm `docker image ls -qa` 2>/dev/null || true
	@-docker volume rm `docker volume ls -q` 2>/dev/null || true
	@-docker network rm `docker network ls -q` 2>/dev/null || true
	@docker system prune -af

vclean: stop
	@rm -rf /var/lib/docker/volumes/srcs_postgres_data

re: clean all

setup-dev:
	python -m venv venv
	. venv/bin/activate && pip install -r srcs/django/tools/requirements.txt

run-dev:
	. venv/bin/activate && python srcs/django/django_app/manage.py runserver

run-dev-docker:
	docker compose -f ./docker-compose.yml up --build -d
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

.PHONY: all build down logs logs-nginx logs-django logs-db ps clean fclean re help

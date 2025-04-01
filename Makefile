VOLUME_PATH = .

all: run

run:
	mkdir -p -m 777 ${VOLUME_PATH}/postgres_data ${VOLUME_PATH}/media_data
	docker compose -f ./docker-compose.yml up --build

stop:
	@docker compose -f ./docker-compose.yml down

clean: stop
	@-docker stop `docker ps -qa` 2>/dev/null || true
	@-docker rm `docker ps -qa` 2>/dev/null || true
	@-docker image rm `docker image ls -qa` 2>/dev/null || true
	@-docker volume rm `docker volume ls -q` 2>/dev/null || true
	@-docker network rm `docker network ls -q` 2>/dev/null || true
	@docker system prune -af

vclean: stop
	rm -rf ${VOLUME_PATH}/postgres_data
	rm -rf ${VOLUME_PATH}/media_data

fclean: clean vclean

migrate:
	docker exec django python manage.py migrate

re: fclean all

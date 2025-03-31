VOLUME_PATH = /path/to/sgoinfre

all: run

run:
	sudo mkdir -p ${VOLUME_PATH}/postgres_data ${VOLUME_PATH}/media_data
	sudo chown 999:999 ${VOLUME_PATH}/postgres_data
	sudo chown 1000:1000 ${VOLUME_PATH}/media_data
	sudo chmod 755 ${VOLUME_PATH}/postgres_data ${VOLUME_PATH}/media_data
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
	sudo rm -rf ${VOLUME_PATH}/postgres_data
	sudo rm -rf ${VOLUME_PATH}/media_data

migrate:
	docker exec django python manage.py migrate

re: clean all

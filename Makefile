all: run

run:
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
	@rm -rf /var/lib/docker/volumes/srcs_postgres_data

re: clean all

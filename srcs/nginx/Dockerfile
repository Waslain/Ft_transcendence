FROM nginx:alpine

COPY ./conf/ /etc/nginx/

RUN rm -rf /usr/share/nginx/html

COPY ./content /usr/share/nginx/html

EXPOSE 80

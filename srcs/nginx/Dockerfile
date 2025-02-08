FROM nginx:alpine

RUN apk update && apk upgrade && \
    apk add --no-cache \
    openssl \
    curl \
    shadow \
    && rm -rf /var/cache/apk/*


RUN usermod -u 4242 nginx

# Create SSL directory and set permissions first
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chmod 755 /etc/nginx/ssl

# Generate SSL certificate as root
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost/emailAddress=project@sample.com" && \
    chmod 600 /etc/nginx/ssl/nginx.key && \
    chmod 644 /etc/nginx/ssl/nginx.crt && \
    chown nginx:nginx /etc/nginx/ssl/nginx.key && \
    chown nginx:nginx /etc/nginx/ssl/nginx.crt

# Copy nginx configuration
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/app.conf /etc/nginx/conf.d/default.conf

# Set ownership and permissions
RUN chown -R nginx:nginx /etc/nginx /var/run /var/cache/nginx /var/log/nginx && \
    chmod 644 /etc/nginx/nginx.conf && \
    chmod 600 /etc/nginx/ssl/nginx.key && \
    chmod 644 /etc/nginx/ssl/nginx.crt && \
    chmod 755 /var/run && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

USER nginx

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
# daemon off: Runs Nginx in foreground (Docker best practice)

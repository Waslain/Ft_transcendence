FROM nginx:alpine

RUN addgroup -S nginxgroup && adduser -S -G nginxgroup nginxuser

RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    chown -R nginxuser:nginxgroup /etc/nginx/conf.d

# Create new PID file with non-root user read/write access
RUN touch /var/run/nginx.pid && \
    chown -R nginxuser:nginxgroup /var/run/nginx.pid

USER nginxuser
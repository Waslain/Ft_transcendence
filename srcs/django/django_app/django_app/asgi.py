"""
ASGI config for django_app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_app.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django_app.middleware import TokenAuthMiddlewareStack
from django_app.middleware import RouteNotFoundMiddleware
import chat.routing
import pong.routing


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack(
        RouteNotFoundMiddleware(
            URLRouter(
                chat.routing.websocket_urlpatterns + pong.routing.websocket_urlpatterns
            )
		)
    ),
})

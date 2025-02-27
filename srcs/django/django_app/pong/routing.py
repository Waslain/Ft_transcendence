from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/pong/waitingRoom/$", consumers.WaitingRoomConsumer.as_asgi()),
	re_path(r"ws/pong/pongRoom/$", consumers.PlayerConsumer.as_asgi()),
]
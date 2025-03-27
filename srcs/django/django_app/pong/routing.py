from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
  re_path(r"ws/pong/waitingRoom/$", consumers.GameWaitingRoomConsumer.as_asgi()),
	re_path(r"ws/pong/pongRoom/$", consumers.GamePlayerConsumer.as_asgi()),
	re_path(r"ws/tournament/waitingRoom/$", consumers.TournamentWaitingRoomConsumer.as_asgi()),
	re_path(r"ws/tournament/tournamentRoom/$", consumers.TournamentPlayerConsumer.as_asgi()),
]
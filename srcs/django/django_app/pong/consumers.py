import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer

class PlayerConsumer(AsyncWebsocketConsumer):
    playersNb = 0
    players = []
    async def connect(self):
        self.room_name = "waitingRoom"
        self.room_group_name = f"waiting_room_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        self.name = self.scope["query_string"].decode("utf-8").split("=")[1]

        PlayerConsumer.players.append(self)
        PlayerConsumer.playersNb += 1
        await self.accept()
        await self.sendPlayerNumber()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        PlayerConsumer.players.remove(self)
        PlayerConsumer.playersNb -= 1
        await self.sendPlayerNumber()

    async def sendPlayerNumber(self):
        if PlayerConsumer.playersNb == 2:
            uuidStr = str(uuid.uuid4())
            for player in PlayerConsumer.players:
                await player.send(text_data=json.dumps({
                    'uuid': uuidStr,
                }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_count',
                'count': PlayerConsumer.playersNb,
            }
        )

    async def connection_count(self, event):
        count = event['count']
        await self.send(text_data=json.dumps({
            'count': count,
        }))

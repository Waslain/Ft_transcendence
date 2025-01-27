import json

from channels.generic.websocket import AsyncWebsocketConsumer

class PlayerConsumer(AsyncWebsocketConsumer):
    playerNb = 0
    async def connect(self):
        self.room_name = "waitingRoom"
        self.room_group_name = f"waiting_room_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        PlayerConsumer.playerNb += 1
        await self.sendPlayerNumber()

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        PlayerConsumer.playerNb -= 1
        await self.sendPlayerNumber()

    async def sendPlayerNumber(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_count',
                'count': PlayerConsumer.playerNb
            }
        )
    async def connection_count(self, event):
        count = event['count']
        await self.send(text_data=json.dumps({
            'count': count
        }))
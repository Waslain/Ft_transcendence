import json
import uuid
import asyncio
from typing import Dict, List
from urllib import parse

from channels.generic.websocket import AsyncWebsocketConsumer

class WaitingRoomConsumer(AsyncWebsocketConsumer):
    playersNb = 0
    players = []

    async def connect(self):
        self.room_group_name = "waiting_room"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        self.name = self.scope["query_string"].decode("utf-8").split("=")[1]

        WaitingRoomConsumer.players.append(self)
        WaitingRoomConsumer.playersNb += 1
        await self.accept()
        await self.sendPlayerNumber()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        WaitingRoomConsumer.players.remove(self)
        WaitingRoomConsumer.playersNb -= 1
        await self.sendPlayerNumber()

    async def sendPlayerNumber(self):
        if WaitingRoomConsumer.playersNb == 2:
            uuidStr = str(uuid.uuid4())
            for player in WaitingRoomConsumer.players:
                await player.send(text_data=json.dumps({
                    'uuid': uuidStr,
                }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_count',
                'count': WaitingRoomConsumer.playersNb,
            }
        )

    async def connection_count(self, event):
        count = event['count']
        await self.send(text_data=json.dumps({
            'count': count,
        }))

class Playground:
    radius = 0.5
    width = 30
    height = 20

class MovingEntity:
    def __init__(self):
        self.x = 0
        self.z = 0

    def toDict(self):
        return {"x": self.x, "z": self.z}

    def setPos(self, x, z):
        self.x = x
        self.z = z

class Ball(MovingEntity):
    def __init__(self):
        super().__init__()
        self.radius = 0.3
        self.dx = 0.02
        self.dz = 0.02

class Paddle(MovingEntity):
    def __init__(self):
        super().__init__()
        self.radius = 0.3
        self.length = 2
        self.speed = 0.1

class Player:
    def __init__(self, name):
        self.name = name
        self.keyUp = False
        self.keyDown = False
        self.score = 0
        self.paddle = Paddle()

    def movePlayer(self, playground):
        if self.keyUp == True:
            if self.paddle.z >= -(playground.height / 2 - playground.radius * 2 - self.paddle.length / 2):
                self.paddle.z -= self.paddle.speed
        if self.keyDown == True:
            if self.paddle.z <= playground.height / 2 - playground.radius * 2 - self.paddle.length / 2:
                self.paddle.z += self.paddle.speed

class GameManager:
    def __init__(self):
        self.playground = Playground()
        self.ball = Ball()
        self.loop = None
        self.players : List[Player] = []

class PlayerConsumer(AsyncWebsocketConsumer):
    games : Dict[str, GameManager] = {}

    async def connect(self):
        queryString = parse.parse_qs(self.scope["query_string"].decode())
        self.uuid = queryString["uuid"][0]
        self.name = queryString["name"][0]
        self.room_group_name = f"pong_room_{self.uuid}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if not self.uuid in PlayerConsumer.games:
            PlayerConsumer.games[self.uuid] = GameManager()
        PlayerConsumer.games[self.uuid].players.append(Player(self.name))
        await self.accept()

        if len(PlayerConsumer.games[self.uuid].players) >= 2:
            if PlayerConsumer.games[self.uuid].loop is None:
                PlayerConsumer.games[self.uuid].loop = asyncio.create_task(self.sendLoopGame())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.uuid in PlayerConsumer.games:
            for player in PlayerConsumer.games[self.uuid].players:
                if player.name is self.name:
                    PlayerConsumer.games[self.uuid].players.remove(player)
            if not PlayerConsumer.games[self.uuid].players:
                if PlayerConsumer.games[self.uuid].loop is not None:
                    PlayerConsumer.games[self.uuid].loop.cancel()
                del PlayerConsumer.games[self.uuid]

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["action"] == "keys":
            for player in PlayerConsumer.games[self.uuid].players:
                if player.name is self.name:
                    if data["params"]["key"] == "z" or data["params"]["key"] == "ArrowUp":
                        if data["params"]["type"] == "keydown":
                            player.keyUp = True
                        else:
                            player.keyUp = False
                    if data["params"]["key"] == "s" or data["params"]["key"] == "ArrowDown":
                        if data["params"]["type"] == "keydown":
                            player.keyDown = True
                        else:
                            player.keyDown = False

    async def sendLoopGame(self):
        await self.groupSend("names", [player.name for player in PlayerConsumer.games[self.uuid].players])
        await self.groupSend("scores", [player.score for player in PlayerConsumer.games[self.uuid].players])
        playground = PlayerConsumer.games[self.uuid].playground
        ball = PlayerConsumer.games[self.uuid].ball
        paddleLeft = PlayerConsumer.games[self.uuid].players[0].paddle
        paddleRight = PlayerConsumer.games[self.uuid].players[1].paddle
        paddleLeft.setPos(-(playground.width / 2 - playground.radius - paddleLeft.length / 2), 0)
        paddleRight.setPos(playground.width / 2 - playground.radius - paddleRight.length / 2, 0)
        while True:
            await self.groupSend("data", {"ball": PlayerConsumer.games[self.uuid].ball.toDict() ,"players": [player.paddle.toDict() for player in PlayerConsumer.games[self.uuid].players]})
            for player in PlayerConsumer.games[self.uuid].players:
                player.movePlayer(playground)
            ball.x += ball.dx
            ball.z += ball.dz
            if ball.x >= (playground.width / 2 - playground.radius - ball.radius) or ball.x <= -(playground.width / 2 - playground.radius - ball.radius):
                if len(PlayerConsumer.games[self.uuid].players) >= 2:
                    if ball.x >= playground.width / 2 - playground.radius - ball.radius:
                        PlayerConsumer.games[self.uuid].players[0].score += 1
                        await self.groupSend("scores", [player.score for player in PlayerConsumer.games[self.uuid].players])
                        if PlayerConsumer.games[self.uuid].players[0].score >= 10:
                            await self.groupSend("winner", PlayerConsumer.games[self.uuid].players[0].name)
                            break
                    elif ball.x <= -(playground.width / 2 - playground.radius - ball.radius):
                        PlayerConsumer.games[self.uuid].players[1].score += 1
                        await self.groupSend("scores", [player.score for player in PlayerConsumer.games[self.uuid].players])
                        if PlayerConsumer.games[self.uuid].players[1].score >= 10:
                            await self.groupSend("winner", PlayerConsumer.games[self.uuid].players[1].name)
                            break
                ball.dx *= -1
                ball.setPos(0, 0)
            if ball.z >= (playground.height / 2 - playground.radius - ball.radius) or ball.z <= -(playground.height / 2 - playground.radius - ball.radius):
                ball.dz *= -1
            await asyncio.sleep(0.01)

    async def groupSend(self, name, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'gameUpdate',
                name: data
            }
        )

    async def gameUpdate(self, event):
        if "names" in event:
            await self.send(text_data=json.dumps({"action": "names", "params": {"names": event["names"]}}))
            return
        if "scores" in event:
            await self.send(text_data=json.dumps({"action": "scores", "params": {"scores": event["scores"]}}))
            return
        if "data" in event:
            await self.send(text_data=json.dumps({"action": "loop", "params": {"data": event["data"]}}))
            return
        if "winner" in event:
            await self.send(text_data=json.dumps({"action": "win", "params": {"winner": event["winner"]}}))
            return
import json
import uuid
import asyncio
from typing import Dict, List
from urllib import parse
import math

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
    radiusWall = 0.5
    radiusWidth = 15
    radiusHeight = 10
    diffBorderPlayer = 1.5

class MovingEntity:
    def __init__(self):
        self.x = 0
        self.z = 0

    def toDict(self):
        return {"x": self.x, "z": self.z}

    def setPos(self, x, z):
        self.x = round(x, 2)
        self.z = round(z, 2)

class Ball(MovingEntity):
    def __init__(self):
        super().__init__()
        self.radius = 0.3
        self.dx = 0.1
        self.dz = 0.1
    
    def setDirection(self, dx, dz):
        self.dx = dx
        self.dz = dz

class Paddle(MovingEntity):
    def __init__(self):
        super().__init__()
        self.radiusWidth = 0.3
        self.radiusHeight = 1
        self.speed = 0.1

class Player:
    def __init__(self, name):
        self.name = name
        self.connected = True
        self.keyUp = False
        self.keyDown = False
        self.score = 0
        self.paddle = Paddle()

    def movePlayer(self, playground):
        if self.keyUp == True:
            if self.paddle.z >= -(round(playground.radiusHeight - playground.radiusWall * 2 - self.paddle.radiusHeight + (self.paddle.radiusWidth / 2), 2)):
                self.paddle.z = round(self.paddle.z - self.paddle.speed, 2)
        if self.keyDown == True:
            if self.paddle.z <= round(playground.radiusHeight - playground.radiusWall * 2 - self.paddle.radiusHeight + (self.paddle.radiusWidth / 2), 2):
                self.paddle.z = round(self.paddle.z + self.paddle.speed, 2)

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

    def isEveryoneOffline(self, players):
        for player in players:
            if player.connected == True:
                return False
        return True

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.uuid in PlayerConsumer.games:
            for player in PlayerConsumer.games[self.uuid].players:
                if player.name is self.name:
                    player.connected = False
            if self.isEveryoneOffline(PlayerConsumer.games[self.uuid].players):
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

    async def updateScore(self, player, ball):
        player.score += 1
        await self.groupSend("scores", [player.score for player in PlayerConsumer.games[self.uuid].players])
        if player.score >= 10:
            await self.groupSend("messages", {"first": "Winner is", "second": player.name})
            return "win"
        ball.setDirection(ball.dx * -1, ball.dz)
        ball.setPos(0, ball.z)
        return None

    async def isPlayerOffline(self, players):
        if not players[0].connected:
            await self.groupSend("messages", {"first": players[0].name + " is Disconnected", "second": "Winner is " + players[1].name})
            return True
        elif not players[1].connected:
            await self.groupSend("messages", {"first": players[1].name + " is Disconnected", "second": "Winner is " + players[0].name})
            return True
        return False

    async def sendLoopGame(self):
        await self.groupSend("names", [player.name for player in PlayerConsumer.games[self.uuid].players])
        await self.groupSend("scores", [player.score for player in PlayerConsumer.games[self.uuid].players])
        playground = PlayerConsumer.games[self.uuid].playground
        ball = PlayerConsumer.games[self.uuid].ball
        paddle = Paddle()
        paddleLeft = PlayerConsumer.games[self.uuid].players[0].paddle
        paddleRight = PlayerConsumer.games[self.uuid].players[1].paddle
        paddleLeft.setPos(-(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2)), 0)
        paddleRight.setPos(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2), 0)
        playgroundWidthLimit = round(playground.radiusWidth - playground.radiusWall - ball.radius, 2)
        playgroundHeightLimit = round(playground.radiusHeight - playground.radiusWall - ball.radius, 2)
        paddleLimit = round(playground.radiusWidth - playground.diffBorderPlayer - paddle.radiusWidth - ball.radius, 2)
        paddleRadius = round(paddle.radiusHeight + paddle.radiusWidth + ball.radius, 2)

        while True:
            await self.groupSend("data", {"ball": PlayerConsumer.games[self.uuid].ball.toDict() ,"players": [player.paddle.toDict() for player in PlayerConsumer.games[self.uuid].players]})
            for player in PlayerConsumer.games[self.uuid].players:
                player.movePlayer(playground)
            ball.setPos(round(ball.x + ball.dx, 2), round(ball.z + ball.dz, 2))
            if ball.x >= paddleLimit and round(paddleRight.z - paddleRadius, 2) <= ball.z <= round(paddleRight.z + paddleRadius, 2):
                relIntersect = (ball.z - paddleRight.z) / paddle.radiusHeight
                newAngle = relIntersect * math.radians(45)
                speed = math.sqrt(ball.dx**2 + ball.dz**2)
                ball.setDirection(-(speed) * math.cos(newAngle), speed * math.sin(newAngle))
            elif ball.x <= -(paddleLimit) and round(paddleLeft.z - paddleRadius, 2) <= ball.z <= round(paddleLeft.z + paddleRadius, 2):
                relIntersect = (ball.z - paddleLeft.z) / paddle.radiusHeight
                newAngle = relIntersect * math.radians(45)
                speed = math.sqrt(ball.dx**2 + ball.dz**2)
                ball.setDirection(speed * math.cos(newAngle), speed * math.sin(newAngle))
            if ball.x >= playgroundWidthLimit:
                if await self.updateScore(PlayerConsumer.games[self.uuid].players[0], ball) == "win":
                    break
            elif ball.x <= -(playgroundWidthLimit):
                if await self.updateScore(PlayerConsumer.games[self.uuid].players[1], ball) == "win":
                    break
            if await self.isPlayerOffline(PlayerConsumer.games[self.uuid].players):
                break
            if ball.z >= playgroundHeightLimit or ball.z <= -(playgroundHeightLimit):
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
        if "messages" in event:
            await self.send(text_data=json.dumps({"action": "message", "params": {"messages": event["messages"]}}))
            return
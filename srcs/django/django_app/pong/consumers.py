import json
import uuid
import asyncio
from typing import Dict, List
from urllib import parse
import math
from datetime import datetime
import random

from channels.generic.websocket import AsyncWebsocketConsumer

from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from matchhistory.views import create_match_record
User = get_user_model()

@database_sync_to_async
def changeInGameUserValue(self, value):
    try:
        user = User.objects.get(id=self.scope['user'].id)
        user.in_game = value
        user.save()
    except:
        pass

class GameWaitingRoomConsumer(AsyncWebsocketConsumer):
    playersNb = 0
    players = []

    async def connect(self):
        await changeInGameUserValue(self, True)
        self.room_group_name = "game_waiting_room"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        GameWaitingRoomConsumer.players.append(self)
        GameWaitingRoomConsumer.playersNb += 1
        await self.accept()
        await self.sendPlayerNumber()


    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        GameWaitingRoomConsumer.players.remove(self)
        GameWaitingRoomConsumer.playersNb -= 1
        await self.sendPlayerNumber()

    async def sendPlayerNumber(self):
        if GameWaitingRoomConsumer.playersNb == 2:
            uuidStr = str(uuid.uuid4())
            for player in GameWaitingRoomConsumer.players:
                await player.send(text_data=json.dumps({
                    'uuid': uuidStr,
                }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_count',
                'count': GameWaitingRoomConsumer.playersNb,
            }
        )

    async def connection_count(self, event):
        count = event['count']
        await self.send(text_data=json.dumps({
            'count': count,
        }))

class TournamentWaitingRoomConsumer(AsyncWebsocketConsumer):
    playersNb = 0
    players = []

    async def connect(self):
        await changeInGameUserValue(self, True)
        self.room_group_name = "tournament_waiting_room"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        TournamentWaitingRoomConsumer.players.append(self)
        TournamentWaitingRoomConsumer.playersNb += 1
        await self.accept()
        await self.sendPlayerNumber()


    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        TournamentWaitingRoomConsumer.players.remove(self)
        TournamentWaitingRoomConsumer.playersNb -= 1
        await self.sendPlayerNumber()

    async def sendPlayerNumber(self):
        if TournamentWaitingRoomConsumer.playersNb == 4:
            uuidStr = str(uuid.uuid4())
            for player in TournamentWaitingRoomConsumer.players:
                await player.send(text_data=json.dumps({
                    'uuid': uuidStr,
                }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_count',
                'count': TournamentWaitingRoomConsumer.playersNb,
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
    def __init__(self, name, idUser, channelName):
        self.name = name
        self.idUser = idUser
        self.gameName = None
        self.connected = True
        self.keyUp = False
        self.keyDown = False
        self.score = 0
        self.paddle = Paddle()
        self.channelName = channelName

    def movePlayer(self, playground):
        if self.keyUp == True:
            if self.paddle.z >= -(round(playground.radiusHeight - playground.radiusWall * 2 - self.paddle.radiusHeight + (self.paddle.radiusWidth / 2), 2)):
                self.paddle.z = round(self.paddle.z - self.paddle.speed, 2)
        if self.keyDown == True:
            if self.paddle.z <= round(playground.radiusHeight - playground.radiusWall * 2 - self.paddle.radiusHeight + (self.paddle.radiusWidth / 2), 2):
                self.paddle.z = round(self.paddle.z + self.paddle.speed, 2)

class GameManager:
    def __init__(self, gameName):
        self.gameName = gameName
        self.playground = Playground()
        self.ball = Ball()
        self.loop = None
        self.players : List[Player] = []
        self.winner = None
        self.secondWinner = None
        self.time = None

class TournamentManager:
    def __init__(self, uuid):
        self.firstGame = GameManager(f"firstGame_{uuid}")
        self.secondGame = GameManager(f"secondGame_{uuid}")
        self.finalGame = GameManager(f"finalGame_{uuid}")
        self.players : List[Player] = []

@database_sync_to_async
def sendMatchResult(stats):
    return create_match_record(stats["players"]["first"]["id"], stats["players"]["second"]["id"],
                               stats["players"]["first"]["score"], stats["players"]["second"]["score"],
                               stats["time"])

class LocalGamePlayerConsumer(AsyncWebsocketConsumer):
    players = []

    async def connect(self):
        await changeInGameUserValue(self, True)
        self.game = GameManager(None)
        self.game.players.append(Player(self.scope['user'].username, self.scope['user'].id, None))
        self.game.players.append(Player(self.scope['user'].username + "(1)", self.scope['user'].id, None))
        self.game.loop = asyncio.create_task(self.sendLoopGame(self.game))
        LocalGamePlayerConsumer.players.append(self)
        await self.accept()

    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        self.game.loop.cancel()
        LocalGamePlayerConsumer.players.remove(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if not isinstance(data, dict) or "action" not in data or "params" not in data:
                return
            if data["action"] == "keys":
                key = data["params"].get("key", "")
                key_type = data["params"].get("type", "")
                if key in ("w"):
                    self.game.players[0].keyUp = key_type == "keydown"
                elif key in ("s"):
                    self.game.players[0].keyDown = key_type == "keydown"
                elif key in ("ArrowUp"):
                    self.game.players[1].keyUp = key_type == "keydown"
                elif key in ("ArrowDown"):
                    self.game.players[1].keyDown = key_type == "keydown"
        except json.JSONDecodeError:
            print("Error : Invalid JSON")

    async def updateScore(self, gameManager, player, ball):
        player.score += 1
        await self.gameUpdate({"scores": [player.score for player in gameManager.players]})
        if player.score >= 10:
            await self.gameUpdate({"messages": {"first": "Winner is", "second": player.name, "type":"winner"}})
            return "win"
        ball.setDirection(ball.dx * -1, ball.dz)
        ball.setPos(0, ball.z)
        return None

    async def sendLoopGame(self, gameManager):
        await self.gameUpdate({"names": [player.name for player in gameManager.players]})
        await self.gameUpdate({"scores": [player.score for player in gameManager.players]})
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "3", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "2", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "1", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "", "second": ""}})
        gameManager.time = datetime.now()
        playground = gameManager.playground
        ball = gameManager.ball
        paddle = Paddle()
        paddleLeft = gameManager.players[0].paddle
        paddleRight = gameManager.players[1].paddle
        paddleLeft.setPos(-(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2)), 0)
        paddleRight.setPos(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2), 0)
        playgroundWidthLimit = round(playground.radiusWidth - playground.radiusWall - ball.radius, 2)
        playgroundHeightLimit = round(playground.radiusHeight - playground.radiusWall - ball.radius, 2)
        paddleLimit = round(playground.radiusWidth - playground.diffBorderPlayer - paddle.radiusWidth - ball.radius, 2)
        paddleRadius = round(paddle.radiusHeight + paddle.radiusWidth + ball.radius, 2)

        while True:
            await self.gameUpdate({"data": {"ball": gameManager.ball.toDict() ,"players": [player.paddle.toDict() for player in gameManager.players]}})
            for player in gameManager.players:
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
                if await self.updateScore(gameManager, gameManager.players[0], ball) == "win":
                    break
            elif ball.x <= -(playgroundWidthLimit):
                if await self.updateScore(gameManager, gameManager.players[1], ball) == "win":
                    break
            if ball.z >= playgroundHeightLimit or ball.z <= -(playgroundHeightLimit):
                ball.dz *= -1
            await asyncio.sleep(0.01)

        gameManager.time = datetime.now() - gameManager.time;
        await sendMatchResult({
            "players" : {
                "first" : {"id": gameManager.players[0].idUser,
                           "score": gameManager.players[0].score},
                "second" : {"id": gameManager.players[1].idUser,
                            "score": gameManager.players[1].score}},
            "time": gameManager.time}
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

class LocalTournamentPlayerConsumer(AsyncWebsocketConsumer):
    players = []

    async def connect(self):
        await changeInGameUserValue(self, True)
        queryString = parse.parse_qs(self.scope["query_string"].decode())
        self.game = GameManager(None)
        self.game.players.append(Player(queryString.get("name", ["Anonymous"])[0], self.scope['user'].id, None))
        self.game.players.append(Player("(1)" + queryString.get("name", ["Anonymous"])[0], self.scope['user'].id, None))
        self.game.players.append(Player("(2)" + queryString.get("name", ["Anonymous"])[0], self.scope['user'].id, None))
        self.game.players.append(Player("(3)" + queryString.get("name", ["Anonymous"])[0], self.scope['user'].id, None))
        random.shuffle(self.game.players)
        self.game.loop = asyncio.create_task(self.sendLoopGame(self.game))
        LocalGamePlayerConsumer.players.append(self)
        await self.accept()

    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        self.game.loop.cancel()
        LocalGamePlayerConsumer.players.remove(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if not isinstance(data, dict) or "action" not in data or "params" not in data:
                return
            if data["action"] == "keys":
                key = data["params"].get("key", "")
                key_type = data["params"].get("type", "")
                if key in ("w"):
                    self.game.players[0].keyUp = key_type == "keydown"
                elif key in ("s"):
                    self.game.players[0].keyDown = key_type == "keydown"
                elif key in ("ArrowUp"):
                    self.game.players[1].keyUp = key_type == "keydown"
                elif key in ("ArrowDown"):
                    self.game.players[1].keyDown = key_type == "keydown"
        except json.JSONDecodeError:
            print("Error : Invalid JSON")

    async def updateScore(self, gameManager, player, ball):
        player.score += 1
        await self.gameUpdate({"scores": [player.score for player in gameManager.players]})
        if player.score >= 10:
            await self.gameUpdate({"messages": {"first": "Winner is", "second": player.name, "type":"winner"}})
            player.score = 0
            if gameManager.winner == None:
                gameManager.winner = player
            elif gameManager.secondWinner == None:
                gameManager.secondWinner = player
            else:
                return "finalWin"
            return "win"
        ball.setDirection(ball.dx * -1, ball.dz)
        ball.setPos(0, ball.z)
        return None

    async def sendLoopGame(self, gameManager):
        await self.gameUpdate({"tournamentMatch": [{"name": player.name, "id": player.idUser} for player in gameManager.players]})
        await self.gameUpdate({"names": [player.name for player in gameManager.players]})
        await self.gameUpdate({"scores": [player.score for player in gameManager.players]})
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "3", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "2", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "Game Starts in :", "second": "1", "type": "timer"}})
        await asyncio.sleep(1)
        await self.gameUpdate({"messages": {"first": "", "second": ""}})
        status = None
        playground = gameManager.playground
        ball = gameManager.ball
        paddle = Paddle()
        paddleLeft = gameManager.players[0].paddle
        paddleRight = gameManager.players[1].paddle
        paddleLeft.setPos(-(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2)), 0)
        paddleRight.setPos(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2), 0)
        playgroundWidthLimit = round(playground.radiusWidth - playground.radiusWall - ball.radius, 2)
        playgroundHeightLimit = round(playground.radiusHeight - playground.radiusWall - ball.radius, 2)
        paddleLimit = round(playground.radiusWidth - playground.diffBorderPlayer - paddle.radiusWidth - ball.radius, 2)
        paddleRadius = round(paddle.radiusHeight + paddle.radiusWidth + ball.radius, 2)

        while True:
            await self.gameUpdate({"data": {"ball": gameManager.ball.toDict() ,"players": [player.paddle.toDict() for player in gameManager.players]}})
            for player in gameManager.players:
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
                status = await self.updateScore(gameManager, gameManager.players[0], ball)
                if status == "finalWin":
                    return
                elif status == "win":
                    break
            elif ball.x <= -(playgroundWidthLimit):
                status = await self.updateScore(gameManager, gameManager.players[1], ball)
                if status == "finalWin":
                    return
                elif status == "win":
                    break
            if ball.z >= playgroundHeightLimit or ball.z <= -(playgroundHeightLimit):
                ball.dz *= -1
            await asyncio.sleep(0.01)

        gameManager.players.remove(gameManager.players[0])
        gameManager.players.remove(gameManager.players[0])
        if gameManager.winner is not None and gameManager.secondWinner is not None:
            gameManager.players.append(gameManager.winner)
            gameManager.players.append(gameManager.secondWinner)
        await asyncio.sleep(3)
        await self.gameUpdate({"messages": {"first": "Next Match :", "second": gameManager.players[0].name + " vs " + gameManager.players[1].name, "type": "vs"}})
        await asyncio.sleep(3)
        ball.setPos(0, 0)
        await self.sendLoopGame(gameManager)

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
        if "tournamentMatch" in event:
            await self.send(text_data=json.dumps({"action": "tournamentMatch", "params": {"players": event["tournamentMatch"]}}))
            return

class GamePlayerConsumer(AsyncWebsocketConsumer):
    games : Dict[str, GameManager] = {}

    async def connect(self):
        await changeInGameUserValue(self, True)
        queryString = parse.parse_qs(self.scope["query_string"].decode())
        self.uuid = queryString.get("uuid", ["0"])[0]
        self.name = self.scope['user'].username
        self.idUser = self.scope['user'].id
        self.room_group_name = f"pong_room_{self.uuid}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if not self.uuid in GamePlayerConsumer.games:
            GamePlayerConsumer.games[self.uuid] = GameManager(self.room_group_name)
        GamePlayerConsumer.games[self.uuid].players.append(Player(self.name, self.idUser, self.channel_name))
        await self.accept()

        if len(GamePlayerConsumer.games[self.uuid].players) == 2:
            if GamePlayerConsumer.games[self.uuid].loop is None:
                GamePlayerConsumer.games[self.uuid].loop = asyncio.create_task(self.sendLoopGame(GamePlayerConsumer.games[self.uuid]))

    def isEveryoneOffline(self, players):
        for player in players:
            if player.connected == True:
                return False
        return True

    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.uuid in GamePlayerConsumer.games:
            for player in GamePlayerConsumer.games[self.uuid].players:
                if player.name is self.name:
                    player.connected = False
            if self.isEveryoneOffline(GamePlayerConsumer.games[self.uuid].players):
                if GamePlayerConsumer.games[self.uuid].loop is not None:
                    GamePlayerConsumer.games[self.uuid].loop.cancel()
                del GamePlayerConsumer.games[self.uuid]

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if not isinstance(data, dict) or "action" not in data or "params" not in data:
                return
            if data["action"] == "keys":
                if not GamePlayerConsumer.games.get(self.uuid):
                    return
                for player in GamePlayerConsumer.games[self.uuid].players:
                    if player.name == self.name:
                        key = data["params"].get("key", "")
                        key_type = data["params"].get("type", "")
                        if key in ("w", "ArrowUp"):
                            player.keyUp = key_type == "keydown"
                        elif key in ("s", "ArrowDown"):
                            player.keyDown = key_type == "keydown"
        except json.JSONDecodeError:
            print("Error : Invalid JSON")

    async def updateScore(self, gameManager, player, ball):
        player.score += 1
        await self.groupSend(gameManager.gameName, "scores", [player.score for player in GamePlayerConsumer.games[self.uuid].players])
        if player.score >= 10:
            await self.groupSend(gameManager.gameName, "messages", {"first": "Winner is", "second": player.name, "type":"winner"})
            return "win"
        ball.setDirection(ball.dx * -1, ball.dz)
        ball.setPos(0, ball.z)
        return None

    async def isPlayerOffline(self, gameManager, players):
        if not players[0].connected:
            players[0].score = 0
            players[1].score = 10
            await self.groupSend(gameManager.gameName, "scores", [player.score for player in players])
            await self.groupSend(gameManager.gameName, "messages", {"first": players[0].name, "second": players[1].name, "type":"disconnect"})
            return True
        elif not players[1].connected:
            players[0].score = 10
            players[1].score = 0
            await self.groupSend(gameManager.gameName, "scores", [player.score for player in players])
            await self.groupSend(gameManager.gameName, "messages", {"first": players[1].name, "second": players[0].name, "type":"disconnect"})
            return True
        return False

    async def sendLoopGame(self, gameManager):
        await self.groupSend(gameManager.gameName, "names", [player.name for player in gameManager.players])
        await self.groupSend(gameManager.gameName, "scores", [player.score for player in gameManager.players])
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Starts in :", "second": "3", "type": "timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Starts in :", "second": "2", "type": "timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Starts in :", "second": "1", "type": "timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "", "second": ""})
        gameManager.time = datetime.now()
        playground = gameManager.playground
        ball = gameManager.ball
        paddle = Paddle()
        paddleLeft = gameManager.players[0].paddle
        paddleRight = gameManager.players[1].paddle
        paddleLeft.setPos(-(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2)), 0)
        paddleRight.setPos(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2), 0)
        playgroundWidthLimit = round(playground.radiusWidth - playground.radiusWall - ball.radius, 2)
        playgroundHeightLimit = round(playground.radiusHeight - playground.radiusWall - ball.radius, 2)
        paddleLimit = round(playground.radiusWidth - playground.diffBorderPlayer - paddle.radiusWidth - ball.radius, 2)
        paddleRadius = round(paddle.radiusHeight + paddle.radiusWidth + ball.radius, 2)

        while True:
            await self.groupSend(gameManager.gameName, "data", {"ball": gameManager.ball.toDict() ,"players": [player.paddle.toDict() for player in gameManager.players]})
            for player in gameManager.players:
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
                if await self.updateScore(gameManager, gameManager.players[0], ball) == "win":
                    break
            elif ball.x <= -(playgroundWidthLimit):
                if await self.updateScore(gameManager, gameManager.players[1], ball) == "win":
                    break
            if await self.isPlayerOffline(gameManager, gameManager.players):
                break
            if ball.z >= playgroundHeightLimit or ball.z <= -(playgroundHeightLimit):
                ball.dz *= -1
            await asyncio.sleep(0.01)

        gameManager.time = datetime.now() - gameManager.time;
        await sendMatchResult({
            "players" : {
                "first" : {"id": gameManager.players[0].idUser,
                           "score": gameManager.players[0].score},
                "second" : {"id": gameManager.players[1].idUser,
                            "score": gameManager.players[1].score}},
            "time": gameManager.time}
        )

    async def groupSend(self, roomName, name, data):
        await self.channel_layer.group_send(
            roomName,
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

class TournamentPlayerConsumer(AsyncWebsocketConsumer):
    games : Dict[str, GameManager] = {}

    async def connect(self):
        await changeInGameUserValue(self, True)
        queryString = parse.parse_qs(self.scope["query_string"].decode())
        self.uuid = queryString.get("uuid", ["0"])[0]
        self.name = queryString.get("name", ["Anonymous"])[0]
        self.idUser = self.scope['user'].id
        self.room_group_name = f"tournament_room_{self.uuid}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if not self.uuid in TournamentPlayerConsumer.games:
            TournamentPlayerConsumer.games[self.uuid] = TournamentManager(self.uuid)
        TournamentPlayerConsumer.games[self.uuid].players.append(Player(self.name, self.idUser, self.channel_name))
        await self.accept()

        playersTotal = len(TournamentPlayerConsumer.games[self.uuid].players)
        if playersTotal <= 4:
            for player in TournamentPlayerConsumer.games[self.uuid].players:
                if player.name == self.name:
                    if playersTotal <= 2:
                        player.gameName = f"firstGame_{self.uuid}"
                        TournamentPlayerConsumer.games[self.uuid].firstGame.players.append(player)
                    else:
                        player.gameName = f"secondGame_{self.uuid}"
                        TournamentPlayerConsumer.games[self.uuid].secondGame.players.append(player)
                    await self.channel_layer.group_add(player.gameName, self.channel_name)

        if len(TournamentPlayerConsumer.games[self.uuid].players) == 4:
            if TournamentPlayerConsumer.games[self.uuid].firstGame.loop is None:
                TournamentPlayerConsumer.games[self.uuid].firstGame.loop = asyncio.create_task(self.sendLoopGame(TournamentPlayerConsumer.games[self.uuid].firstGame, TournamentPlayerConsumer.games[self.uuid].finalGame))
            if TournamentPlayerConsumer.games[self.uuid].secondGame.loop is None:
                TournamentPlayerConsumer.games[self.uuid].secondGame.loop = asyncio.create_task(self.sendLoopGame(TournamentPlayerConsumer.games[self.uuid].secondGame, TournamentPlayerConsumer.games[self.uuid].finalGame))

    def isEveryoneOffline(self, players):
        for player in players:
            if player.connected == True:
                return False
        return True

    async def disconnect(self, close_code):
        await changeInGameUserValue(self, False)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.uuid in TournamentPlayerConsumer.games:
            for player in TournamentPlayerConsumer.games[self.uuid].players:
                if player.name == self.name:
                    player.connected = False
                    if player.gameName is not None:
                        await self.channel_layer.group_discard(player.gameName, self.channel_name)
            if self.isEveryoneOffline(TournamentPlayerConsumer.games[self.uuid].players):
                if TournamentPlayerConsumer.games[self.uuid].firstGame.loop is not None:
                    TournamentPlayerConsumer.games[self.uuid].firstGame.loop.cancel()
                if TournamentPlayerConsumer.games[self.uuid].secondGame.loop is not None:
                    TournamentPlayerConsumer.games[self.uuid].secondGame.loop.cancel()
                if TournamentPlayerConsumer.games[self.uuid].finalGame.loop is not None:
                    TournamentPlayerConsumer.games[self.uuid].finalGame.loop.cancel()
                del TournamentPlayerConsumer.games[self.uuid]

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if not isinstance(data, dict) or "action" not in data or "params" not in data:
                return
            if data["action"] == "keys":
                if not TournamentPlayerConsumer.games.get(self.uuid):
                    return
                for player in TournamentPlayerConsumer.games[self.uuid].players:
                    if player.name == self.name:
                        key = data["params"].get("key", "")
                        key_type = data["params"].get("type", "")
                        if key in ("w", "ArrowUp"):
                            player.keyUp = key_type == "keydown"
                        elif key in ("s", "ArrowDown"):
                            player.keyDown = key_type == "keydown"
        except json.JSONDecodeError:
            print("Error : Invalid JSON")

    async def updateScore(self, gameManager, player, ball):
        player.score += 1
        await self.groupSend(gameManager.gameName, "scores", [player.score for player in gameManager.players])
        if player.score >= 10:
            await self.groupSend(gameManager.gameName, "messages", {"first": "Winner is", "second": player.name, "type":"winner"})
            gameManager.winner = player
            return "win"
        ball.setDirection(ball.dx * -1, ball.dz)
        ball.setPos(0, ball.z)
        return None

    async def isPlayerOffline(self, gameManager, players):
        if not players[0].connected:
            players[0].score = 0
            players[1].score = 10
            await self.groupSend(gameManager.gameName, "scores", [player.score for player in players])
            await self.groupSend(gameManager.gameName, "messages", {"first": players[0].name, "second":players[1].name, "type":"disconnect"})
            gameManager.winner = players[1]
            return True
        elif not players[1].connected:
            players[0].score = 10
            players[1].score = 0
            await self.groupSend(gameManager.gameName, "scores", [player.score for player in players])
            await self.groupSend(gameManager.gameName, "messages", {"first": players[1].name, "second": players[0].name, "type":"disconnect"})
            gameManager.winner = players[0]
            return True
        return False

    async def startFinalGame(self, gameManager, finalGame):
        gameManager.winner.score = 0
        gameManager.winner.gameName = f"finalGame_{self.uuid}"
        await self.channel_layer.group_add(gameManager.winner.gameName, gameManager.winner.channelName)
        finalGame.players.append(gameManager.winner)
        if len(finalGame.players) == 2:
            if finalGame.loop is None:
                finalGame.loop = asyncio.create_task(self.sendLoopGame(finalGame, None))

    async def sendLoopGame(self, gameManager, finalGame):
        await self.groupSend(gameManager.gameName, "tournamentMatch", [{"name": player.name, "id": player.idUser} for player in gameManager.players])
        await self.groupSend(gameManager.gameName, "names", [player.name for player in gameManager.players])
        await self.groupSend(gameManager.gameName, "scores", [player.score for player in gameManager.players])
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Started in :", "second": "3", "type":"timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Started in :", "second": "2", "type":"timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "Game Started in :", "second": "1", "type":"timer"})
        await asyncio.sleep(1)
        await self.groupSend(gameManager.gameName, "messages", {"first": "", "second": ""})
        playground = gameManager.playground
        ball = gameManager.ball
        paddle = Paddle()
        paddleLeft = gameManager.players[0].paddle
        paddleRight = gameManager.players[1].paddle
        paddleLeft.setPos(-(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2)), 0)
        paddleRight.setPos(round(playground.radiusWidth - playground.radiusWall - paddle.radiusHeight, 2), 0)
        playgroundWidthLimit = round(playground.radiusWidth - playground.radiusWall - ball.radius, 2)
        playgroundHeightLimit = round(playground.radiusHeight - playground.radiusWall - ball.radius, 2)
        paddleLimit = round(playground.radiusWidth - playground.diffBorderPlayer - paddle.radiusWidth - ball.radius, 2)
        paddleRadius = round(paddle.radiusHeight + paddle.radiusWidth + ball.radius, 2)

        while True:
            await self.groupSend(gameManager.gameName, "data", {"ball": gameManager.ball.toDict() ,"players": [player.paddle.toDict() for player in gameManager.players]})
            for player in gameManager.players:
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
                if await self.updateScore(gameManager, gameManager.players[0], ball) == "win":
                    break
            elif ball.x <= -(playgroundWidthLimit):
                if await self.updateScore(gameManager, gameManager.players[1], ball) == "win":
                    break
            if await self.isPlayerOffline(gameManager, gameManager.players):
                break
            if ball.z >= playgroundHeightLimit or ball.z <= -(playgroundHeightLimit):
                ball.dz *= -1
            await asyncio.sleep(0.01)

        if finalGame is not None:
            await self.startFinalGame(gameManager, finalGame)

    async def groupSend(self, roomName, name, data):
        await self.channel_layer.group_send(
            roomName,
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
        if "tournamentMatch" in event:
            await self.send(text_data=json.dumps({"action": "tournamentMatch", "params": {"players": event["tournamentMatch"]}}))
            return

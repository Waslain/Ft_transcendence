import json
import uuid
import asyncio
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

class PlayerConsumer(AsyncWebsocketConsumer):
    games = {}

    async def connect(self):
        queryString = parse.parse_qs(self.scope["query_string"].decode())
        self.uuid = queryString["uuid"][0]
        self.name = queryString["name"][0]
        self.room_group_name = f"pong_room_{self.uuid}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if not self.uuid in PlayerConsumer.games:
            PlayerConsumer.games[self.uuid] = {"loop" : None, "players" : [], "ball" : {"x" : 0, "z" : 0, "dx" : 0.1, "dz" : 0.1}}
        PlayerConsumer.games[self.uuid]["players"].append({"name" : self.name, "score" : 0, "up" : False, "down" : False, "paddle" : {"x" : 13.5, "z" : 0}})
        if len(PlayerConsumer.games[self.uuid]["players"]) == 1:
            PlayerConsumer.games[self.uuid]["players"][0]["paddle"]["x"] = -13.5
        await self.accept()

        if len(PlayerConsumer.games[self.uuid]["players"]) >= 2:
            if PlayerConsumer.games[self.uuid]["loop"] is None:
                PlayerConsumer.games[self.uuid]["loop"] = asyncio.create_task(self.sendLoopGame())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.uuid in PlayerConsumer.games:
            for player in PlayerConsumer.games[self.uuid]["players"]:
                if player["name"] is self.name:
                    PlayerConsumer.games[self.uuid]["players"].remove(player)
            if not PlayerConsumer.games[self.uuid]["players"]:
                if PlayerConsumer.games[self.uuid]["loop"] is not None:
                    PlayerConsumer.games[self.uuid]["loop"].cancel()
                del PlayerConsumer.games[self.uuid]

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["action"] == "keys":
            for player in PlayerConsumer.games[self.uuid]["players"]:
                if player["name"] is self.name:
                    if data["params"]["key"] == "z" or data["params"]["key"] == "ArrowUp":
                        if data["params"]["type"] == "keydown":
                            player["up"] = True
                        else:
                            player["up"] = False
                    if data["params"]["key"] == "s" or data["params"]["key"] == "ArrowDown":
                        if data["params"]["type"] == "keydown":
                            player["down"] = True
                        else:
                            player["down"] = False

    async def sendLoopGame(self):
        await self.groupSend("names", [player["name"] for player in PlayerConsumer.games[self.uuid]["players"]])
        await self.groupSend("scores", [player["score"] for player in PlayerConsumer.games[self.uuid]["players"]])
        while True:
            await self.groupSend("data", {"ball": PlayerConsumer.games[self.uuid]["ball"] ,"players": [player["paddle"] for player in PlayerConsumer.games[self.uuid]["players"]]})
            for player in PlayerConsumer.games[self.uuid]["players"]:
                if player["up"] == True:
                    if player["paddle"]["z"] > -8:
                        player["paddle"]["z"] -= 0.1
                if player["down"] == True:
                    if player["paddle"]["z"] < 8:
                        player["paddle"]["z"] += 0.1
            ball = PlayerConsumer.games[self.uuid]["ball"]
            ball["x"] += ball["dx"]
            ball["z"] += ball["dz"]
            if ball["x"] > 14.1 or ball["x"] < -14.1:
                if len(PlayerConsumer.games[self.uuid]["players"]) >= 2:
                    if ball["x"] > 14.1:
                        PlayerConsumer.games[self.uuid]["players"][0]["score"] += 1
                        await self.groupSend("scores", [player["score"] for player in PlayerConsumer.games[self.uuid]["players"]])
                        if PlayerConsumer.games[self.uuid]["players"][0]["score"] >= 10:
                            await self.groupSend("winner", PlayerConsumer.games[self.uuid]["players"][0]["name"])
                            break
                    elif ball["x"] < -14.1:
                        PlayerConsumer.games[self.uuid]["players"][1]["score"] += 1
                        await self.groupSend("scores", [player["score"] for player in PlayerConsumer.games[self.uuid]["players"]])
                        if PlayerConsumer.games[self.uuid]["players"][1]["score"] >= 10:
                            await self.groupSend("winner", PlayerConsumer.games[self.uuid]["players"][1]["name"])
                            break
                ball["dx"] *= -1
                ball["x"] = 0
                ball["z"] = 0
            if ball["z"] > 9.1 or ball["z"] < -9.1:
                ball["dz"] *= -1
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
import { updateName } from "./updateName.js";
import { updateScore } from "./updateScore.js";
import { updateMessage } from "./updateMessage.js";
import { text } from "../../../index.js"

const parseMessages = (data) => {
	if (!('type' in data)) {
		return (data);
	}
	if (data.type === "timer") {
		data.first = text.pong.start;
		return data;
	}
	if (data.type === "winner") {
		data.first = text.pong.winner;
		return data;
	}
	if (data.type === "disconnect") {
		data.first = data.first + " " + text.pong.disconnect;
		data.second = text.pong.winner + " " + data.second;
		return data;
	}
	return (data);
}

export const handleSocketMessage = (objectManager, socket) => {
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch (data.action) {
      case "names":
        objectManager.player1.name = data.params.names[0];
        updateName(objectManager.player1, 1, objectManager.scene);
        objectManager.player2.name = data.params.names[1];
        updateName(objectManager.player2, 2, objectManager.scene);
        break;
      case "scores":
        if (data.params.scores[0] !== objectManager.player1.score) {
          objectManager.player1.score = data.params.scores[0];
          updateScore(objectManager.player1, 1, objectManager.scene);
        }
        if (
          data.params.scores.length >= 2 &&
          data.params.scores[1] !== objectManager.player2.score
        ) {
          objectManager.player2.score = data.params.scores[1];
          updateScore(objectManager.player2, 2, objectManager.scene, 1);
        }
        break;
      case "loop":
        objectManager.ball.object.position.set(
          data.params.data.ball.x,
          0.3,
          data.params.data.ball.z
        );
        objectManager.player1.object.position.set(
          data.params.data.players[0].x,
          0.3,
          data.params.data.players[0].z
        );
        objectManager.player2.object.position.set(
          data.params.data.players[1].x,
          0.3,
          data.params.data.players[1].z
        );
        break;
      case "message":
	const messages = parseMessages(data.params.messages);
        updateMessage(
          objectManager,
          messages.first,
          messages.second,
          objectManager.scene
        );
        break;
    }
  };
};

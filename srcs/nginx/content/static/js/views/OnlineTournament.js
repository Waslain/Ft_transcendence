import Pong from "./pong/Pong.js";
import { onlineGame } from "./pong/onlineGame.js";
import { cleanScene } from "./pong/utils/cleanScene.js";

export default class extends Pong {
  constructor(params) {
    super();
    this.params = params;
    this.setTitle("Transcendence");
    this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: "/tournament/" + this.params.room_id,
    };
  }

  #tournamentRoomSocket;
  #abortController;
  #objectManager;

  async #webSocket() {
    const roomName = "tournamentRoom";
    const url =
      "wss://" +
      window.location.host +
      "/ws/tournament/tournamentRoom/?uuid=" +
      encodeURIComponent(this.params.room_id);

    this.#tournamentRoomSocket = new WebSocket(url);

    this.#tournamentRoomSocket.onopen = (e) => {
      console.log("Connected to the tournament room:", roomName);
    };

    this.#tournamentRoomSocket.onclose = (e) => {
      console.log("Tournament room socket closed");
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    await this.#webSocket();

    this.#objectManager = onlineGame(
      this.#tournamentRoomSocket,
      this.#abortController.signal
    );
  }

  async cleanUp() {
    cleanScene(this.#objectManager);
    this.#tournamentRoomSocket?.close();
    this.#abortController.abort();
  }
}

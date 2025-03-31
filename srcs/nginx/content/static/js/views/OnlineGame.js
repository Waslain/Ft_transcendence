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
      urlAfterLogin: "/pong/" + this.params.room_id,
    };
  }

  #pongRoomSocket;
  #abortController;
  #objectManager;

  async #webSocket(name) {
    const roomName = "pongRoom";
    const url =
      "wss://" +
      window.location.hostname +
      ":8080/ws/pong/pongRoom/?uuid=" +
      encodeURIComponent(this.params.room_id) +
      "&name=" +
      name;

    this.#pongRoomSocket = new WebSocket(url);

    this.#pongRoomSocket.onopen = (e) => {
      console.log("Connected to the pong room:", roomName);
    };

    this.#pongRoomSocket.onclose = (e) => {
      console.log("Pong room socket closed");
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    const searchParams = new URLSearchParams(window.location.search);
    await this.#webSocket(searchParams.get("name") || "Anonymous");

    this.#objectManager = onlineGame(
      this.#pongRoomSocket,
      this.#abortController.signal
    );
  }

  async cleanUp() {
    cleanScene(this.#objectManager);
    this.#pongRoomSocket?.close();
    this.#abortController.abort();
  }
}

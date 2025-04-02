import LocalPong from "./pong/LocalPong.js";
import { onlineGame } from "./pong/onlineGame.js";
import { cleanScene } from "./pong/utils/cleanScene.js";

export default class extends LocalPong {
  constructor() {
    super();
    this.setTitle("Transcendence");
    this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: "/pong/localGame",
    };
  }

  #pongLocalSocket;
  #abortController;
  #objectManager;

  async #webSocket() {
    const roomName = "pongLocal";
    const url = "wss://" + window.location.host + "/ws/pong/pongLocal";

    this.#pongLocalSocket = new WebSocket(url);

    this.#pongLocalSocket.onopen = (e) => {
      console.log("Connected to the pong local:", roomName);
    };

    this.#pongLocalSocket.onclose = (e) => {
      console.log("Pong local socket closed");
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    await this.#webSocket();

    this.#objectManager = onlineGame(
      this.#pongLocalSocket,
      this.#abortController.signal
    );
  }

  async cleanUp() {
    cleanScene(this.#objectManager);
    this.#pongLocalSocket?.close();
    this.#abortController.abort();
  }
}

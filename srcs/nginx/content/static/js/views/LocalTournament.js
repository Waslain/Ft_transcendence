import Pong from "./pong/Pong.js";
import { onlineGame } from "./pong/onlineGame.js";
import { cleanScene } from "./pong/utils/cleanScene.js";

export default class extends Pong {
  constructor() {
    super();
    this.searchParams = new URLSearchParams(window.location.search);
    this.setTitle("Transcendence");
    this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: `/pong/localTournament?name=${encodeURIComponent(
        this.searchParams.get("name") || "Anonymous"
      )}`,
    };
  }

  #tournamentLocalSocket;
  #abortController;
  #objectManager;

  async #webSocket(name) {
    const roomName = "tournamentLocal";
    // const url = "wss://" + window.location.host + "/ws/pong/tournamentLocal";
    const url = `wss://${window.location.host}/ws/pong/tournamentLocal?name=${name}`;

    this.#tournamentLocalSocket = new WebSocket(url);

    this.#tournamentLocalSocket.onopen = (e) => {
      console.log("Connected to the tournament local:", roomName);
    };

    this.#tournamentLocalSocket.onclose = (e) => {
      console.log("Tournament local socket closed");
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    await this.#webSocket(this.searchParams.get("name") || "Anonymous");

    this.#objectManager = onlineGame(
      this.#tournamentLocalSocket,
      this.#abortController.signal
    );
  }

  async cleanUp() {
    cleanScene(this.#objectManager);
    this.#tournamentLocalSocket?.close();
    this.#abortController.abort();
  }
}

import { navigateTo } from "../index.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super();
    this.params = params;
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
      <a href="/" class="nav__link" data-link>Go back to main page</a>
			<h1>Pong</h1>
      <div id="connectionCount">Connections: 0</div>
    `;
  }

  #pongRoomSocket;

  async #webSocket(name) {
    const roomName = "pongRoom";

    this.pongRoomSocket = new WebSocket(
      "ws://" + window.location.hostname + ":8000/ws/pong/pongRoom/"
    );

    this.pongRoomSocket.onopen = (e) => {
      console.log("Connected to the pong room:", roomName);
      this.pongRoomSocket.send(
        JSON.stringify({ uuid: this.params.room_id, name: name })
      );
    };

    this.pongRoomSocket.onclose = (e) => {
      console.log("Pong room socket closed");
    };

    this.pongRoomSocket.onmessage = (e) => {
      console.log(e.data);
      const data = JSON.parse(e.data);
      if (data.count !== undefined) {
        document.getElementById("connectionCount").textContent =
          "Connections: " + data.count;
      }
    };
  }

  async getJavaScript() {
    const searchParams = new URLSearchParams(window.location.search);
    await this.#webSocket(searchParams.get("name"));
  }

  async cleanUp() {
    this.pongRoomSocket?.close();
  }
}

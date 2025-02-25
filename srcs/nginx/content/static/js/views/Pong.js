import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
			<a href="/" class="nav__link" data-link>Go back to main page</a>
      <h1>Waiting Room ...</h1>
      <button id="playBtn">Play</button>
      <button id="cancelBtn" disabled>Cancel</button>
			<div id="connection-count" hidden>Connections: 0</div>
		`;
  }

  #waitingRoomSocket;

  async #webSocket() {
    const roomName = "waitingRoom";

    this.waitingRoomSocket = new WebSocket(
      "ws://" + window.location.hostname + ":8000/ws/pong/waitingRoom/"
    );

    this.waitingRoomSocket.onopen = function (e) {
      console.log("Connected to the waiting room:", roomName);
    };

    this.waitingRoomSocket.onclose = function (e) {
      console.log("Waiting room socket closed");
    };

    this.waitingRoomSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      if (data.count !== undefined) {
        document.getElementById("connection-count").textContent =
          "Connections: " + data.count;
      }
    };
  }

  changeStatus(searching) {
    return async () => {
      const connectionNb = document.getElementById("connection-count");
      if (searching == true) {
        playBtn.disabled = true;
        cancelBtn.disabled = false;
        connectionNb.hidden = false;
        await this.#webSocket();
      } else {
        playBtn.disabled = false;
        cancelBtn.disabled = true;
        connectionNb.hidden = true;
        this.waitingRoomSocket?.close();
      }
    };
  }

  async getJavaScript() {
    const playBtn = document.getElementById("playBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    playBtn.addEventListener("click", this.changeStatus(true));
    cancelBtn.addEventListener("click", this.changeStatus(false));
  }

  async cleanUp() {
    this.waitingRoomSocket?.close();
  }
}

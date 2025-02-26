import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
			<a href="/" class="nav__link" data-link>Go back to main page</a>
      <h1>Waiting Room ...</h1>
      <input id="nameInput" value=""/>
      <button id="playBtn">Play</button>
      <button id="cancelBtn" disabled>Cancel</button>
			<div id="connectionCount" hidden>Connections: 0</div>
		`;
  }

  #waitingRoomSocket;
  #abortController;

  async #webSocket(name) {
    const roomName = "waitingRoom";

    this.waitingRoomSocket = new WebSocket(
      "ws://" +
        window.location.hostname +
        ":8000/ws/pong/waitingRoom/?name=" +
        encodeURIComponent(name)
    );

    this.waitingRoomSocket.onopen = function (e) {
      console.log("Connected to the waiting room:", roomName);
    };

    this.waitingRoomSocket.onclose = function (e) {
      console.log("Waiting room socket closed");
    };

    this.waitingRoomSocket.onmessage = function (e) {
      console.log(e.data);
      const data = JSON.parse(e.data);
      if (data.count !== undefined) {
        document.getElementById("connectionCount").textContent =
          "Connections: " + data.count;
      }
      if (data.uuid !== undefined) {
        console.log(data.uuid);
        navigateTo("/pong/" + data.uuid);
      }
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    const connectionNb = document.getElementById("connectionCount");
    const playBtn = document.getElementById("playBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const nameInput = document.getElementById("nameInput");
    playBtn.addEventListener(
      "click",
      async () => {
        if (nameInput.value) {
          playBtn.disabled = true;
          cancelBtn.disabled = false;
          connectionNb.hidden = false;
          nameInput.disabled = true;
          await this.#webSocket(nameInput.value);
        }
      },
      {
        signal: this.#abortController.signal,
      }
    );
    cancelBtn.addEventListener(
      "click",
      () => {
        playBtn.disabled = false;
        cancelBtn.disabled = true;
        connectionNb.hidden = true;
        nameInput.disabled = false;
        this.waitingRoomSocket?.close();
      },
      {
        signal: this.#abortController.signal,
      }
    );
  }

  async cleanUp() {
    this.waitingRoomSocket?.close();
    this.#abortController.abort();
  }
}

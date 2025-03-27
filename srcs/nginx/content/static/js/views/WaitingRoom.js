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
      <div>
        <h1>Insert name for play !</h1>
        <input id="nameInput" value=""/>
      </div>
      <div>
        <h1>Waiting Room for Game ...</h1>
        <button id="playBtnGame">Play</button>
        <div id="connectionCountGame" hidden>Connections: 0</div>
      </div>
      <div>
        <h1>Waiting Room for Tournament ...</h1>
        <button id="playBtnTournament">Play</button>
        <div id="connectionCountTournament" hidden>Connections: 0</div>
      </div>
      <button id="cancelBtn" disabled>Cancel</button>
		`;
  }

  #waitingRoomSocket;
  #abortController;

  async #webSocketGame(name) {
    const roomName = "waitingRoom";
    const url =
      "wss://" +
      window.location.hostname +
      "/ws/pong/waitingRoom/?name=" +
      encodeURIComponent(name);

    this.#waitingRoomSocket = new WebSocket(url);

    this.#waitingRoomSocket.onopen = (e) => {
      console.log("Connected to the waiting room:", roomName);
    };

    this.#waitingRoomSocket.onclose = (e) => {
      console.log("Waiting room socket closed");
    };

    this.#waitingRoomSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.count !== undefined) {
        document.getElementById("connectionCountGame").textContent =
          "Connections: " + data.count;
      }
      if (data.uuid !== undefined) {
        navigateTo("/pong/" + data.uuid + "?name=" + encodeURIComponent(name));
      }
    };
  }

  async #webSocketTournament(name) {
    const roomName = "waitingRoom";
    const url =
      "wss://" +
      window.location.hostname +
      "/ws/tournament/waitingRoom/?name=" +
      encodeURIComponent(name);

    this.#waitingRoomSocket = new WebSocket(url);

    this.#waitingRoomSocket.onopen = (e) => {
      console.log("Connected to the waiting room:", roomName);
    };

    this.#waitingRoomSocket.onclose = (e) => {
      console.log("Waiting room socket closed");
    };

    this.#waitingRoomSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.count !== undefined) {
        document.getElementById("connectionCountTournament").textContent =
          "Connections: " + data.count;
      }
      if (data.uuid !== undefined) {
        navigateTo(
          "/tournament/" + data.uuid + "?name=" + encodeURIComponent(name)
        );
      }
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    const nameInput = document.getElementById("nameInput");
    const playBtnGame = document.getElementById("playBtnGame");
    const connectionCountGame = document.getElementById("connectionCountGame");
    const playBtnTournament = document.getElementById("playBtnTournament");
    const connectionCountTournament = document.getElementById(
      "connectionCountTournament"
    );
    const cancelBtn = document.getElementById("cancelBtn");

    playBtnGame.addEventListener(
      "click",
      async () => {
        if (nameInput.value.trim() !== "") {
          nameInput.disabled = true;
          playBtnGame.disabled = true;
          connectionCountGame.hidden = false;
          playBtnTournament.disabled = true;
          connectionCountTournament.hidden = true;
          cancelBtn.disabled = false;

          await this.#webSocketGame(nameInput.value);
        }
      },
      {
        signal: this.#abortController.signal,
      }
    );
    playBtnTournament.addEventListener(
      "click",
      async () => {
        if (nameInput.value.trim() !== "") {
          nameInput.disabled = true;
          playBtnGame.disabled = true;
          connectionCountGame.hidden = true;
          playBtnTournament.disabled = true;
          connectionCountTournament.hidden = false;
          cancelBtn.disabled = false;

          await this.#webSocketTournament(nameInput.value);
        }
      },
      {
        signal: this.#abortController.signal,
      }
    );
    cancelBtn.addEventListener(
      "click",
      () => {
        nameInput.disabled = false;
        playBtnGame.disabled = false;
        connectionCountGame.hidden = true;
        playBtnTournament.disabled = false;
        connectionCountTournament.hidden = true;
        cancelBtn.disabled = true;

        this.#waitingRoomSocket?.close();
      },
      {
        signal: this.#abortController.signal,
      }
    );
  }

  async cleanUp() {
    this.#waitingRoomSocket?.close();
    this.#abortController.abort();
  }
}

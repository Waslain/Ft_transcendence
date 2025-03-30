import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super();
		this.setTitle("Transcendence");
		this.params = params;
		this.redirection = {
			needed: true,
			auth: false,
			url: '/users/login',
			urlAfterLogin: '/pong'
		}
  }

  async getStyle() {
		return `
		.box-wrapper {
			background-color:rgba(197, 197, 197, 0.1);
            backdrop-filter: blur(5px);
			border-radius: 1rem;
		}
    .btn-play {
      background-color: #306598;
			color: #fff;
			border-radius: 25px;
    }
    .btn-cancel {
      background-color: #306598;
			color: #fff;
			border-radius: 25px;
    }
    .btn-cancel:disabled {
      background-color: rgba(0, 0, 0, 0);
      border-color: #fff;
			color: #fff;
			border-radius: 25px;
    }
		`;
	}

  async getHtml() {
    return `
    <div class="container py-5 h-100">
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <h1 class="text-white m-3">Insert name for play!</h1>
      </div>
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <input id="nameInput" style="border-radius: 8px; margin: 10px; height: 40px; width: 210px;" value="" maxlength="20" placeholder="Max character: 20"/>
        <button id="cancelBtn" class="btn-cancel" disabled>Cancel</button>
      </div>
      <br>
      <section>
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">Waiting Room for Game ...</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                  <button id="playBtnGame" class="btn btn-play m-3">Play</button>
                  <div id="connectionCountGame" class="text-white" hidden>Current connections: 0</div>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">Waiting Room for Tournament ...</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                <button id="playBtnTournament" class="btn btn-play m-3">Play</button>
                <div id="connectionCountTournament" class="text-white" hidden>Current connections: 0</div>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
        </div>
      </section>
			<a href="/" class="nav__link d-flex justify-content-center align-items-center" data-link>Go back to main page</a>
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
          "Current connections: " + data.count;
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
          "Current connections: " + data.count;
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
          playBtnGame.style.color = '#fff';
          connectionCountGame.hidden = false;
          playBtnTournament.disabled = true;
          playBtnTournament.style.color = '#fff';
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
          playBtnGame.style.color = '#fff';
          connectionCountGame.hidden = true;
          playBtnTournament.disabled = true;
          playBtnTournament.style.color = '#fff';
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

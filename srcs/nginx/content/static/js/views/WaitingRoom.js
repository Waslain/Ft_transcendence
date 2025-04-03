import AbstractView from "./AbstractView.js";
import { navigateTo, text } from "../index.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
    this.redirection = {
      needed: true,
      auth: false,
      url: "/users/login",
      urlAfterLogin: "/pong",
    };
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
    const t = text.waitingRoom;
    return `
    <div class="container py-5 h-100">
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <h1 class="text-white m-3">${t.gameTitle}</h1>
      </div>
      <br>
      <section>
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">${
                t.localGameText
              }</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                  <button id="playBtnLocalGame" class="btn btn-play m-3">${
                    t.play
                  }</button>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">${
                t.onlineGameText
              }</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                  <button id="playBtnOnlineGame" class="btn btn-play m-3">${
                    t.play
                  } </button>
                  <div id="connectionCountGame" class="text-white" hidden>Current connections: 0</div>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
        </div>
      </section>
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <h1 class="text-white m-3">${t.tournamentTitle}</h1>
      </div>
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <p class="text-white m-3">${t.alias} :</p>
        <input id="nameInput" value=${localStorage.getItem(
          "username"
        )} style="border-radius: 8px; margin: 10px; height: 40px; width: 210px;" value="" maxlength="20" placeholder="Max character: 20"/>
      </div>
      <br>
      <section>
        <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">${
                t.localTournamentText
              }</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                <button id="playBtnLocalTournament" class="btn btn-play m-3">${
                  t.play
                } </button>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-5 col-xxl-5 mb-4">
            <div class="card widget-card border-light shadow-sm box-wrapper">
              <div class="card-header text-center text-white border-light fw-medium align-items-cente fs-5">${
                t.onlineTournamentText
              }</div>
              <div class="card-body d-flex justify-content-center align-items-center">
                <button id="playBtnOnlineTournament" class="btn btn-play m-3">${
                  t.play
                }</button>
                <div id="connectionCountTournament" class="text-white" hidden>Current connections: 0</div>
              </div>
              <div class="card-footer border-light"></div>
            </div>
          </div>
        </div>
      </section>
      <div class="row-fluid d-flex justify-content-center align-items-center">
        <button id="cancelBtn" class="btn-cancel" disabled>${t.cancel}</button>
      </div>
      <br>
			<a href="/" class="nav__link d-flex justify-content-center align-items-center" data-link>${
        t.back
      }</a>
		`;
  }

  #waitingRoomSocket;
  #abortController;

  async #webSocketGame() {
    const roomName = "waitingRoom";
    const url = "wss://" + window.location.host + "/ws/pong/waitingRoom/";

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
          text.waitingRoom.connections + data.count;
      }
      if (data.uuid !== undefined) {
        navigateTo("/pong/" + data.uuid);
      }
    };
  }

  async #webSocketTournament() {
    const roomName = "waitingRoom";
    const url = "wss://" + window.location.host + "/ws/tournament/waitingRoom/";

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
          text.waitingRoom.connections + data.count;
      }
      if (data.uuid !== undefined) {
        navigateTo("/tournament/" + data.uuid);
      }
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    const playBtnLocalGame = document.getElementById("playBtnLocalGame");
    const playBtnLocalTournament = document.getElementById(
      "playBtnLocalTournament"
    );
    const playBtnOnlineGame = document.getElementById("playBtnOnlineGame");
    const connectionCountGame = document.getElementById("connectionCountGame");
    const playBtnOnlineTournament = document.getElementById(
      "playBtnOnlineTournament"
    );
    const connectionCountTournament = document.getElementById(
      "connectionCountTournament"
    );
    const cancelBtn = document.getElementById("cancelBtn");

    playBtnLocalGame.addEventListener(
      "click",
      () => {
        navigateTo("/pong/localGame");
      },
      {
        signal: this.#abortController.signal,
      }
    );
    playBtnLocalTournament.addEventListener(
      "click",
      () => {
        navigateTo("/pong/localTournament");
      },
      {
        signal: this.#abortController.signal,
      }
    );
    playBtnOnlineGame.addEventListener(
      "click",
      async () => {
        playBtnLocalGame.disabled = true;
        playBtnLocalGame.style.color = "#fff";
        playBtnLocalTournament.disabled = true;
        playBtnLocalTournament.style.color = "#fff";
        playBtnOnlineGame.disabled = true;
        playBtnOnlineGame.style.color = "#fff";
        connectionCountGame.hidden = false;
        playBtnOnlineTournament.disabled = true;
        playBtnOnlineTournament.style.color = "#fff";
        connectionCountTournament.hidden = true;
        cancelBtn.disabled = false;

        await this.#webSocketGame();
      },
      {
        signal: this.#abortController.signal,
      }
    );
    playBtnOnlineTournament.addEventListener(
      "click",
      async () => {
        playBtnLocalGame.disabled = true;
        playBtnLocalGame.style.color = "#fff";
        playBtnLocalTournament.disabled = true;
        playBtnLocalTournament.style.color = "#fff";
        playBtnOnlineGame.disabled = true;
        playBtnOnlineGame.style.color = "#fff";
        connectionCountGame.hidden = true;
        playBtnOnlineTournament.disabled = true;
        playBtnOnlineTournament.style.color = "#fff";
        connectionCountTournament.hidden = false;
        cancelBtn.disabled = false;

        await this.#webSocketTournament();
      },
      {
        signal: this.#abortController.signal,
      }
    );
    cancelBtn.addEventListener(
      "click",
      () => {
        playBtnLocalGame.disabled = false;
        playBtnLocalTournament.disabled = false;
        playBtnOnlineGame.disabled = false;
        connectionCountGame.hidden = true;
        playBtnOnlineTournament.disabled = false;
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

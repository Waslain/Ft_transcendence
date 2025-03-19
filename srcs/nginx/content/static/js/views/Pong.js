import AbstractView from "./AbstractView.js";
import { game } from "./pong/game.js";

export default class extends AbstractView {
  constructor(params) {
    super();
    this.params = params;
    this.setTitle("Transcendence");
  }

  async getStyle() {
    return `body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        overflow: hidden;
      }
      #startBtn {
        background-color: #ffffff;
        color: rgb(0, 0, 0);
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border-radius: 5px;
        position: absolute;
        user-select: none;
      }
      .box {
        position: absolute;
        width: 50px;
        height: 275px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #333;
        border-radius: 15px;
        border: 2px solid #999;
        box-shadow: 0 0 30px #ffffff60;
        top: 15px;
        right: 15px;
        user-select: none;
      }
      #soundBtn {
        background: none;
        color: rgb(255, 255, 255);
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 5px;
        position: absolute;
        top: 0px;
        user-select: none;
        display: flex;
        align-items: center;
      }
      #volume {
        position: absolute;
        top: 50px;
        cursor: pointer;
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        height: 200px;
        accent-color: #b1b1b1;
      }
    `;
  }

  async getHtml() {
    return `<div class="box">
        <button id="soundBtn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-volume-off"
          >
            <path d="M16 9a5 5 0 0 1 .95 2.293" />
            <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
            <path d="m2 2 20 20" />
            <path
              d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"
            />
            <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
          </svg>
        </button>
        <input type="range" id="volume" name="volume" />
      </div>
    `;
  }

  #pongRoomSocket;
  #abortController;

  async #webSocket(name) {
    const roomName = "pongRoom";
	const url = "wss://" +
        window.location.hostname +
        "/ws/pong/pongRoom/?uuid=" +
        encodeURIComponent(this.params.room_id) +
        "&name=" +
        name;

    this.pongRoomSocket = new WebSocket(url);

    this.pongRoomSocket.onopen = (e) => {
      console.log("Connected to the pong room:", roomName);
    };

    this.pongRoomSocket.onclose = (e) => {
      console.log("Pong room socket closed");
    };
  }

  async getJavaScript() {
    this.#abortController = new AbortController();
    const searchParams = new URLSearchParams(window.location.search);
    await this.#webSocket(searchParams.get("name") || "Anonymous");

    game(this.pongRoomSocket, this.#abortController.signal);
  }

  async cleanUp() {
    this.pongRoomSocket?.close();
    this.#abortController.abort();
  }
}

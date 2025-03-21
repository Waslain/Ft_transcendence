import AbstractView from "./AbstractView.js";
import { startTournament } from "./pong/startTournament.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Transcendence");
  }

  async getHtml() {
    return `
		<a href="/" class="nav__link" data-link>Go back to main page</a>
		<h1>Tournament</h1>
		<div>
			<label for="nbPlayers">Number of players:</label>
			<select id="nbPlayers">
				<option value="" disabled selected>Choose number</option>
				<option value="4">4</option>
				<option value="8">8</option>
				<option value="16">16</option>
			</select>
		</div>
		<div id="playerList">
		</div>
		<button id="startBtn">Start</button>
		`;
  }

  #abortController;

  changePlayerList = (nb) => {
    let list = "<ol>";
    for (let i = 1; i <= nb; i++) {
      list += `<li><input id="player${i}" value=""/></li>`;
    }
    list += "</ol>";
    document.querySelector("#playerList").innerHTML = list;
  };

  checkNames = (names) => {
    return names.every((name) => {
      return name.trim() !== "";
    });
  };

  async getJavaScript() {
    this.#abortController = new AbortController();
    const nbPlayers = document.getElementById("nbPlayers");
    const startBtn = document.getElementById("startBtn");

    nbPlayers.addEventListener(
      "change",
      () => {
        this.changePlayerList(nbPlayers.value);
      },
      {
        signal: this.#abortController.signal,
      }
    );

    startBtn.addEventListener(
      "click",
      () => {
        const playerList = document.querySelectorAll("#playerList ol li input");
        const playerNames = Array.from(playerList).map(
          (player) => player.value
        );
        if (!this.checkNames(playerNames)) {
          return;
        } else {
          startTournament(
            playerNames.sort(() => Math.random() - 0.5),
            this.#abortController.signal
          );
        }
      },
      {
        signal: this.#abortController.signal,
      }
    );
  }

  async cleanUp() {
    this.#abortController.abort();
  }
}

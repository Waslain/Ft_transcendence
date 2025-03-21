import Pong from "./../Pong.js";
import { game } from "./game.js";

export const startTournament = async (players, signal) => {
  console.log("Start tournament with " + players);
  const pongView = new Pong();
  document.querySelector("#style").innerHTML = await pongView.getStyle();
  document.querySelector("#app").innerHTML = await pongView.getHtml();
  game(null, signal);
};

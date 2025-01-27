const enterKey = (event) => {
  if (event.key === "Enter") document.querySelector("#submit").click();
};

const isValidInput = (input) => {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(input);
};

document.querySelector("#player-name-input").onkeyup = enterKey;

document.querySelector("#submit").onclick = function () {
  const playerName = document.querySelector("#player-name-input").value;
  const errorMessage = document.querySelector("#error-message");
  if (playerName !== "" && isValidInput(playerName)) {
    errorMessage.textContent = "";
    window.location.pathname = "/pong/waitingRoom";
  } else {
    errorMessage.textContent =
      "Please enter a valid player name containing only letters and numbers.";
  }
};

const roomName = "waitingRoom";

const waitingRoomSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/pong/waitingRoom/"
);

waitingRoomSocket.onopen = function (e) {
  console.log("Connected to the waiting room:", roomName);
};

waitingRoomSocket.onclose = function (e) {
  console.error("Waiting room socket closed unexpectedly");
};

waitingRoomSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  if (data.count !== undefined) {
    document.getElementById("connection-count").textContent =
      "Connections: " + data.count;
  }
};

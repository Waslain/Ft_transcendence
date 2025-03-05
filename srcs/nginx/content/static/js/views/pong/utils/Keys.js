export class Keys {
  constructor(socket) {
    this.socket = socket;
    this.keys = [
      { name: "z", bool: false },
      { name: "s", bool: false },
      { name: "ArrowUp", bool: false },
      { name: "ArrowDown", bool: false },
    ];
  }
  keyManager(e) {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].name === e.key) {
        if (this.keys[i].bool === false && e.type === "keydown") {
          this.keys[i].bool = true;
          this.socket.send(
            JSON.stringify({
              action: "keys",
              params: { type: e.type, key: e.key },
            })
          );
        } else if (e.type === "keyup") {
          this.keys[i].bool = false;
          this.socket.send(
            JSON.stringify({
              action: "keys",
              params: { type: e.type, key: e.key },
            })
          );
        }
      }
    }
  }
}

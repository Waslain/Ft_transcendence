export class Keys {
  constructor(socket) {
    this.socket = socket;
    this.keys = [
      { name: "ArrowUp", bool: false },
      { name: "ArrowDown", bool: false },
    ];
  }
  keyManager(e) {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].name === e.key) {
        const key = document.getElementById(e.key);
        if (this.keys[i].bool === false && e.type === "keydown") {
          key.classList.add("active");
          this.keys[i].bool = true;
          if (this.socket) {
            this.socket.send(
              JSON.stringify({
                action: "keys",
                params: { type: e.type, key: e.key },
              })
            );
          }
        } else if (e.type === "keyup") {
          key.classList.remove("active");
          this.keys[i].bool = false;
          if (this.socket) {
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
}

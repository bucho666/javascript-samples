const readline = require("readline");
class Terminal {
  constructor() {
    this._console = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
  }

  async start() {
    process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);
    await this.mainLoop();
  }

  async mainLoop() {
    return new Promise(resolve => {
      process.stdin.on("keypress", (ch, key) => {
        if (key.name === "c" && key.ctrl) {
          this._console.close();
          return;
        }
        this.keyEvent(key);
      });
    });
  }

  keyEvent(key) {
    if (key.name === "return") {
      process.stdout.write("\x1b[2J");
      process.stdout.write("\x1b[1;1H");
    } else {
      console.log(key);
    }
  }
}

new Terminal().start();

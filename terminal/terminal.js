const readline = require("readline");

class Terminal {
  constructor(app) {
    this._console = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    this._app = app;
  }

  async start() {
    process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);
    this._app.initialize();
    await this.mainLoop();
  }

  async mainLoop() {
    return new Promise(resolve => {
      process.stdin.on("keypress", (ch, key) => {
        if (key.name === "c" && key.ctrl) {
          this._console.close();
          return;
        }
        this._app.keyEvent(key);
      });
    });
  }
}

module.exports = Terminal;

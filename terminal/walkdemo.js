const Terminal = require("./terminal.js");

const KeyMap = new Map([
  ["h", { x: -1, y: 0 }],
  ["j", { x: 0, y: 1 }],
  ["k", { x: 0, y: -1 }],
  ["l", { x: 1, y: 0 }],
  ["y", { x: -1, y: -1 }],
  ["u", { x: 1, y: -1 }],
  ["b", { x: -1, y: 1 }],
  ["n", { x: 1, y: 1 }]
]);

class WalkDemo {
  constructor() {
    this._x = 1;
    this._y = 1;
  }

  initialize() {
    this.update();
  }

  keyEvent(key) {
    if (!KeyMap.has(key.name)) return;
    const dir = KeyMap.get(key.name);
    this._x += dir.x;
    this._y += dir.y;
    this.update();
  }

  update() {
    this.clear();
    this.put(this._x, this._y, "@");
  }

  put(x, y, char) {
    this.move(x, y);
    this.write(char);
    this.move(x, y);
  }

  clear() {
    this.move(0, 0);
    this.write(`\x1b[2J`);
  }

  move(x, y) {
    this.write(`\x1b[${y}:${x}H`);
  }

  write(string) {
    process.stdout.write(string);
  }
}

new Terminal(new WalkDemo()).start();

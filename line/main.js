class Coord {
  constructor(x, y) {
    [this._x, this._y] = [x, y];
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }

  distance(coord) {
    return new Coord(this.x - coord.x, this.y - coord.y);
  }
  plus(coord) {
    return new Coord(this.x + coord.x, this.y + coord.y);
  }

  lineTo(to, f) {
    const [dx, dy] = [Math.abs(to.x - this.x), Math.abs(to.y - this.y)];
    const [sx, sy] = [(this.x < to.x) ? 1 : -1, (this.y < to.y) ? 1 : -1];
    let [x, y, error] = [this.x, this.y, dx - dy];
    while (x != to.x || y != to.y) {
      if (!f(new Coord(x, y))) break;
      const error2 = error * 2;
      if (error2 > -dy) {
        error -= dy;
        x += sx;
      }
      if (error2 < dx) {
        error += dx;
        y += sy;
      }
    }
  }
}

class DrawLineTest {
  constructor(term) {
    this.term = term;
    this.term.fullscreen(true);
    this.term.grabInput();
    this._center = new Coord(8, 8);
  }

  start() {
    this.term.on("key", (key, matches, data) => {
      this.input(key, matches, data);
    });
    this.drawLine(new Coord(0, 0));
  }

  setCursor(coord) {
    this.term.moveTo(coord.x + 1, coord.y + 1);
    this._cursor = coord;
  }

  drawLine(to) {
    this.setCursor(this._center);
    this.term("X");
    this._center.lineTo(to, coord => {
      if (coord.x == 2 && coord.y == 2) return false;
      this.setCursor(coord);
      this.term(".");
      return true;
    });
    this.setCursor(new Coord(2, 2));
    this.term("#");
    this.setCursor(to);
  }

  input(key, matches, data) {
    switch (key) {
    case "k":
      this.moveTo(new Coord(0, -1));
      break;
    case "j":
      this.moveTo(new Coord(0, 1));
      break;
    case "h":
      this.moveTo(new Coord(-1, 0));
      break;
    case "l":
      this.moveTo(new Coord(1, 0));
      break;
    case "CTRL_C":
    case "ENTER":
      this.exit();
      break;
    }
  }

  exit() {
    this.term.clear();
    this.term.processExit();
  }

  moveTo(direction) {
    this.term.clear();
    this.drawLine(this._cursor.plus(direction));
  }
}
new DrawLineTest(require("terminal-kit").terminal).start();

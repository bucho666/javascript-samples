class Coord {
  constructor(x, y) {
    [this._x, this._y] = [x, y];
  }

  get x() { return this._x; }
  get y() { return this._y; }

  distance(coord) { return new Coord(this.x - coord.x, this.y - coord.y); }
  plus(coord) { return new Coord(this.x + coord.x, this.y + coord.y); }

  lineTo(to, f) {
    const distance = to.distance(this),
      dx = distance.x, dy = distance.y,
      addX = dx / Math.abs(dx), addY = dy / Math.abs(dy),
      absDistanceX = Math.abs(dx), absDistanceY = Math.abs(dy);
    let error, cx = this.x, cy = this.y;
    if (absDistanceX > absDistanceY) {
      error = absDistanceX / 2;
      while (cx != to.x) {
        cx += addX;
        error += absDistanceY;
        if (error > absDistanceX) {
          cy += addY;
          error -= absDistanceX;
        }
        f(new Coord(cx, cy));
      }
    } else {
      error = absDistanceY / 2;
      while (cy != to.y) {
        cy += addY;
        error += absDistanceX;
        if (error > absDistanceY) {
          cx += addX;
          error -= absDistanceY;
        }
        f(new Coord(cx, cy));
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
    this.term.on('key', (key, matches, data)=>{this.input(key, matches, data);});
    this.drawLine(new Coord(0, 0));
  }

  setCursor(coord) {
    this.term.moveTo(coord.x+1, coord.y+1);
    this._cursor = coord;
  }

  drawLine(to) {
    this.setCursor(this._center);
    this.term('X');
    this._center.lineTo(to, (coord)=>{
      this.setCursor(coord);
      this.term('.');
    });
    this.setCursor(to);
  }

  input(key, matches, data) {
    switch(key) {
      case 'k': this.moveTo(new Coord( 0, -1)); break;
      case 'j': this.moveTo(new Coord( 0,  1)); break;
      case 'h': this.moveTo(new Coord(-1,  0)); break;
      case 'l': this.moveTo(new Coord( 1,  0)); break;
      case 'CTRL_C':
      case 'ENTER': this.exit(); break;
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
(new DrawLineTest(require('terminal-kit').terminal)).start();

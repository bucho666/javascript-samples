// メッセージ追加
function addMessage(message) {
    // p要素作成
    const p = document.createElement("p");
    // p要素にテキスト追加
    p.textContent = message;
    // メッセージ要素取得
    const messages = document.getElementById("messages");
    // メッセージ要素にp要素を追加
    messages.appendChild(p);
    // 一番下にスクロール
    messages.scrollTop = messages.scrollHeight;
}

class Entity {
  constructor(symbol, color='silver') {
    this._symbol = symbol;
    this._color = color;
  }

  render(x, y, display) {
    display.draw(x, y, this._symbol, this._color);
  }
}

class Terrain extends Entity {
  constructor(symbol, color='silver', walkable=false) {
    super(symbol, color);
    this._walkable = walkable;
  }

  get isWalkable() { return this._walkable; }
}

const TerrainTable = {
  wall: new Terrain(' '),
  floor: new Terrain('.', 'silver', true),
  door: new Terrain('+', 'olive', true),
}

class Random {
  static number(min, max) {
    const diff = (max - min) + 1;
    return Math.floor(Math.random() * diff) + min;
  }
}

Array.prototype.randomChoice = function() {
  return this[Random.number(0, this.length)];
}

class Map {
  constructor(width, height) {
    this._map = new Array(height)
    for (let y = 0; y < height; y++) {
      this._map[y] = new Array(width);
    }
  }

  render(display) {
    this.forEach((x, y, terrain)=>{
      terrain.render(x, y, display);
    });
  }

  isWalkable(coordinate) {
    return this._map[coordinate.y][coordinate.x].isWalkable;
  }

  openSpaceAtRandom() {
    const openSpaces = [];
    this.forEach((x, y, terrain)=>{
      if (terrain.isWalkable === false) { continue; }
      openSpaces.push(new Coordinate(x, y));
    });
    return openSpaces.randomChoice();
  }

  update(x, y, terrain) {
    this._map[y][x] = terrain;
  }

  forEach(f) {
    for (let y = 0; y < this._map.length; y++) {
      for (let x = 0; x < this._map[y].length; x++) {
        f(x, y, this._map[y][x]);
      }
    }
  }
}

class Coordinate {
  constructor(x=0, y=0) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  plus(otherCoordinate) {
    return new Coordinate(this.x + otherCoordinate.x, this.y + otherCoordinate.y);
  }
}

const Direction = {
  N : new Coordinate(0 , -1), E : new Coordinate(1 ,  0),
  S : new Coordinate(0 ,  1), W : new Coordinate(-1,  0),
  NE: new Coordinate(1 , -1), SE: new Coordinate(1 ,  1),
  SW: new Coordinate(-1,  1), NW: new Coordinate(-1, -1),
};

class Wait {
  constructor(interval) {
    this._startTime = 0;
    this._interval = interval;
  }

  set interval(newInterval) {
    this._interval = newInterval;
  }

  isOver(now) {
    return now - this._startTime >= this._interval;
  }

  reset(now) {
    this._startTime = now;
  }
}

class ActiveEntity extends Entity {
  constructor(symbol, color='silver') {
    super(symbol, color);
    this._wait = new Wait(0);
    this._action = null;
    ActiveEntity.list.push(this);
  }

  setAction(action, interval) {
    this._action = action;
    this._wait.interval = interval;
  }

  update(now) {
    if (this._wait.isOver(now) === false) { return; }
    this._action();
    this._wait.reset(now);
  }

  static startAction() {
    window.requestAnimationFrame((now)=>{ActiveEntity.tick(now)});
  }

  static tick(now) {
    ActiveEntity.list.forEach((e)=>{ e.update(now); });
    ActiveEntity.startAction();
  }

}
ActiveEntity.prototype.list = [];

class Mobile extends ActiveEntity {
  constructor(symbol, color, coordinate = new Coordinate()) {
    super(symbol, color);
    this.coordinate = coordinate;
  }

  get x() { return this.coordinate.x; }
  get y() { return this.coordinate.y; }

  render(display) {
    super.render(this.x, this.y, display);
  }
}

DirectionOfKey = {
  'w': Direction.N, 'd': Direction.E, 's': Direction.S, 'a': Direction.W,
};

class Controller {
  constructor() {
    this._key_state = {};
  }

  keyDown(key) {
    this._key_state[key] = true;
  }

  keyUp(key) {
    if (key in this._key_state) {
      this._key_state[key] = false
    }
  }

  pressed(key) {
    return key in this._key_state && this._key_state[key];
  }
}

class Chaser {
  constructor(chaser, target, map) {
    this._chaser = chaser;
    this._target = target;
    this._map = map;
  }

  action() {
    const aster = new ROT.Path.AStar(
      this._target.x,
      this._target.y,
      (x, y) => {
        return this._map.isWalkable(new Coordinate(x, y))
      });
    const path = [];
    aster.compute(this._chaser.x, this._chaser.y, (x, y)=>{
      path.push(new Coordinate(x, y));
    });
    path.shift(); // 自身の位置を削除
    if (path.length > 1) {
      this._chaser.coordinate = path[0];
    }
  }
}

class Game {
  constructor(screenID) {
    this.setupDisplay(screenID);
    this.generateMap();
    this._player = new Mobile('@', 'silver', this._map.openSpaceAtRandom());
    this._goblin = new Mobile('g', 'blue', this._map.openSpaceAtRandom());
    this._controller = new Controller();
    this._player.setAction(()=>{
      this.update();
    }, 200);
    const ai = new Chaser(this._goblin, this._player, this._map);
    this._goblin.setAction(()=>{
      ai.action();
    }, 400);
    document.onkeydown = (e) => { this._controller.keyDown(e.key) };
    document.onkeyup = (e) => { this._controller.keyUp(e.key) };
  }

  update() {
    for (let key in DirectionOfKey) {
      if (this._controller.pressed(key)) {
        this.movePlayer(DirectionOfKey[key]);
      }
    }
    this.render();
  }

  movePlayer(direction) {
      const newCoordinate = this._player.coordinate.plus(direction);
      if (this._map.isWalkable(newCoordinate) == false) { return; }
      this._player.coordinate = newCoordinate;
  }

  render() {
    this._map.render(this._display);
    this._player.render(this._display);
    this._goblin.render(this._display);
  }

  generateMap() {
    const displayOption = this._display.getOptions();
    const [MAP_WIDTH, MAP_HEIGHT] = [displayOption.width, displayOption.height];
    this._map = new Map(MAP_WIDTH, MAP_HEIGHT);
    const digger = new ROT.Map.Digger(MAP_WIDTH, MAP_HEIGHT);
    digger.create((x, y, isWall)=>{
      this._map.update(x, y, isWall ? TerrainTable.wall : TerrainTable.floor);
    });
    for (const room of digger.getRooms()) {
      room.getDoors((x, y)=>{
        this._map.update(x, y, TerrainTable.door);
      });
    }
  }

  setupDisplay(screenID) {
    this._display = new ROT.Display();
    // display options
    // width -- horizontal size, in characters
    // height -- vertical size, in characters
    // fontSize -- in pixels, default 15
    // fontFamily -- string, default "monospace"
    // fg -- default foreground color; valid CSS color string
    // bg -- default background color; valid CSS color string
    // spacing -- spacing adjustment coefficient; 1 = normal, <1 tighter, >1 looser
    // layout -- what layouting algorithm shall be used; "rect" or "hex"
    this._display.setOptions({ width: 80, height: 24, bg: "white", });
    document.getElementById(screenID).appendChild(this._display.getContainer());
  }
}

new Game("screen");

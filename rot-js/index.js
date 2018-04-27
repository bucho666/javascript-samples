class Random {
  static number(min, max) {
    const diff = (max - min) + 1;
    return Math.floor(Math.random() * diff) + min;
  }
}

Array.prototype.randomChoice = function() {
  return this[Random.number(0, this.length)];
}

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

class EntityMap {
  constructor(width, height) {
    this._map = new Array(height)
    for (let y = 0; y < height; y++) {
      this._map[y] = new Array(width);
    }
  }

  render(display) {
    this.forEach((x, y, e)=>{
      if (e) { e.render(x, y, display); }
    });
  }

  renderAt(x, y, display) {
    this.apply(x, y, (e)=>{ e.render(x, y, display); });
  }

  set(x, y, e) {
    this._map[y][x] = e;
  }

  apply(x, y, f) { f(this._map[y][x]); }

  forEach(f) {
    for (let y = 0; y < this._map.length; y++) {
      for (let x = 0; x < this._map[y].length; x++) {
        f(x, y, this._map[y][x]);
      }
    }
  }
}

class TerrainMap extends EntityMap {
  constructor(width, height) {
    super(width, height);
  }

  isWalkable(coord) {
    return this._map[coord.y][coord.x].isWalkable;
  }

  openSpaceAtRandom() {
    const openSpaces = [];
    this.forEach((x, y, terrain)=>{
      if (terrain.isWalkable === false) { return; }
      openSpaces.push(new Coordinate(x, y));
    });
    return openSpaces.randomChoice();
  }
}

class CharacterMap extends EntityMap {
  constructor(width, height) {
    super(width, height);
  }

  existsAt(coord) {
    return this._map[coord.y][coord.x] !== undefined;
  }

  move(from, to) {
    const c = this._map[from.y][from.x];
    if (!c) { return; }
    this._map[from.y][from.x] = undefined;
    this._map[to.y][to.y] = c;
  }
}

class LevelMap {
  constructor(width, height) {
    this._terrain = new TerrainMap(width, height);
    this._characters = new CharacterMap(width, height);
  }

  render(display) {
    this._terrain.render(display);
    this._characters.render(display);
  }

  setTerrain(x, y, t) { this._terrain.set(x, y, t); }
  setCharacter(x, y, c) { this._characters.set(x, y, c); }

  existsCharacterAt(coord) {
    return this._characters.existsAt(coord)
  }

  moveCharacter(from, to) {
    this._characters.move(from, to);
  }

  isOpenSpace(coord) {
    if (this._characters.existsAt(coord)) return false;
    return this._terrain.isWalkable(coord);
  }

  putCharacterAtRandom(c) {
    const coord = this.openSpaceAtRandom();
    c.coord = c;
    this._characters.set(c, coord);
  }

  openSpaceAtRandom() {
    // TODO 
    return this._terrain.openSpaceAtRandom();
  }
}

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
ActiveEntity.list = [];

class Mobile extends ActiveEntity {
  constructor(symbol, color, coord = new Coordinate()) {
    super(symbol, color);
    this.coord = coord;
  }

  get x() { return this.coord.x; }
  get y() { return this.coord.y; }

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
        return this._map.isOpenSpace(new Coordinate(x, y))
      });
    const path = [];
    aster.compute(this._chaser.x, this._chaser.y, (x, y)=>{
      path.push(new Coordinate(x, y));
    });
    path.shift(); // 自身の位置を削除
    if (path.length > 1) {
      this._map.moveCharacter(this._chaser.coord, path[0]);
    }
  }
}

class Game {
  constructor(screenID) {
    this.setupDisplay(screenID);
    this.generateMap();
    this._player = new Mobile('@', 'silver');
    this._goblin = new Mobile('g', 'blue');
    this._map.putCharacterAtRandom(this._player);
    this._map.putCharacterAtRandom(this._goblin);
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
    ActiveEntity.startAction();
  }

  update() {
    for (let key in DirectionOfKey) {
      if (this._controller.pressed(key)) {
        this.movePlayer(DirectionOfKey[key]);
      }
    }
    this._map.render(this._display);
  }

  movePlayer(direction) {
    const newCoordinate = this._player.coord.plus(direction);
    if (this._map.isOpenSpace(newCoordinate) == false) { return; }
    this._map.moveCharacter(this._player.coord, newCoordinate);
    this._player.coord = newCoordinate;
  }

  generateMap() {
    const displayOption = this._display.getOptions();
    const [MAP_WIDTH, MAP_HEIGHT] = [displayOption.width, displayOption.height];
    this._map = new LevelMap(MAP_WIDTH, MAP_HEIGHT);
    const digger = new ROT.Map.Digger(MAP_WIDTH, MAP_HEIGHT);
    digger.create((x, y, isWall)=>{
      this._map.setTerrain(x, y, isWall ? TerrainTable.wall : TerrainTable.floor);
    });
    for (const room of digger.getRooms()) {
      room.getDoors((x, y)=>{
        this._map.setTerrain(x, y, TerrainTable.door);
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

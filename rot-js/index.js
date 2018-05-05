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

  get symbol() { return this._symbol; }
  get color() { return this._color; }

  render(x, y, display, color=this._color) {
    display.draw(x, y, this._symbol, color);
  }
}

class Terrain extends Entity {
  constructor(symbol, color='silver', walkable=false, lightPassThrough=false) {
    super(symbol, color);
    this._walkable = walkable;
    this._lightPassThrough = lightPassThrough;
  }

  get isWalkable() { return this._walkable; }
  get isLightPassThrough() { return this._lightPassThrough; }
}

const TerrainTable = {
  wall: new Terrain('#', 'olive'),
  floor: new Terrain('.', 'gray', true, true),
  door: new Terrain('+', 'burlywood', true, false),
}

class EntityMap {
  constructor(width, height) {
    this._map = new Array(height)
    for (let y = 0; y < height; y++) {
      this._map[y] = new Array(width);
    }
  }

  get size() {
    return [this._map[0].length, this._map.length];
  }

  render(display) {
    this.forEach((x, y, e)=>{
      if (e) { e.render(x, y, display); }
    });
  }

  renderAt(x, y, display, color=undefined) {
    this.apply(x, y, (e)=>{ if (e) { e.render(x, y, display, color); } });
  }

  isOutbound(coord) {
    return (this._map[coord.y] === undefined ||
            this._map[coord.y][coord.x] === undefined);
  }

  set(x, y, e) {
    this._map[y][x] = e;
  }

  get(x, y) {
    return this._map[y][x];
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
    if (this.isOutbound(coord)) { return false; }
    return this._map[coord.y][coord.x].isWalkable;
  }

  isLightPassThrough(coord) {
    if (this.isOutbound(coord)) { return false; }
    return this._map[coord.y][coord.x].isLightPassThrough;
  }

  openSpaces() {
    const openSpaces = [];
    this.forEach((x, y, terrain)=> {
      if (terrain.isWalkable === false) { return; }
      openSpaces.push(new Coordinate(x, y));
    });
    return openSpaces;
  }

  renderAt(x, y, display) {
    super.renderAt(x, y, display, this._map[y][x].symbol === '.' ? 'white' : undefined);
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
    this._map[to.y][to.x] = c;
    c.coord = to;
  }
}

class LevelMap {
  constructor(width, height) {
    this._terrain = new TerrainMap(width, height);
    this._characters = new CharacterMap(width, height);
  }

  get size() {
    return this._terrain.size;
  }

  render(display) {
    this._terrain.render(display);
    this._characters.render(display);
  }

  renderAt(x, y, display) {
    this._terrain.renderAt(x, y, display);
    this._characters.renderAt(x, y, display);
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
    if (this._terrain.isOutbound(coord)) { return false; }
    if (this._characters.existsAt(coord)) { return false; }
    return this._terrain.isWalkable(coord);
  }

  setTerrain(x, y, t) { this._terrain.set(x, y, t); }
  setCharacter(x, y, c) { this._characters.set(x, y, c); }

  terrain(x, y) { return this._terrain.get(x, y); }

  existsCharacterAt(coord) {
    return this._characters.existsAt(coord)
  }

  moveCharacter(from, to) {
    this._characters.move(from, to);
  }

  isOpenSpace(coord) {
    if (this._characters.existsAt(coord)) { return false };
    return this._terrain.isWalkable(coord);
  }

  isLightPassThrough(coord) {
    return this._terrain.isLightPassThrough(coord);
  }

  putCharacterAtRandom(ch) {
    const coord = this.openSpaceAtRandom();
    ch.coord = coord;
    this._characters.set(coord.x, coord.y, ch);
  }

  openSpaceAtRandom() {
    return this._terrain.openSpaces().filter((coord)=>{
      return this.existsCharacterAt(coord) === false;
    }).randomChoice();
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
        if (this._chaser.x === x && this._chaser.y === y) { return true; }
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

class View {
  constructor(viewer, levelMap) {
    this._levelMap = levelMap;
    this._viewer = viewer;
    this._fov = new ROT.FOV.PreciseShadowcasting((x, y)=>{
      return this._levelMap.isLightPassThrough(new Coordinate(x, y));
    });
    const [h, w] = this._levelMap.size;
    this._memory = new EntityMap(h, w);
  }

  render(display) {
    this._memory.render(display);
    this._fov.compute(
      this._viewer.x, this._viewer.y, 10,
      (x, y, r, visibility)=> {
        this._levelMap.renderAt(x, y, display);
        this._memory.set(x, y, this._levelMap.terrain(x, y));
      });
  }
}

class Game {
  constructor(screenID) {
    this.setupDisplay(screenID);
    this.generateMap();
    this._player = new Mobile('@', 'silver');
    this._map.putCharacterAtRandom(this._player);
    this._controller = new Controller();
    this._player.setAction(()=>{ this.update(); }, 200);
    this._view = new View(this._player, this._map);
    document.onkeydown = (e) => { this._controller.keyDown(e.key) };
    document.onkeyup = (e) => { this._controller.keyUp(e.key) };
    for (let c=0; c < 3; c++) { this._createChaiser(new Mobile('g', 'teal'), 400); }
    for (let c=0; c < 2; c++) { this._createChaiser(new Mobile('s', 'green'), 300); }
    ActiveEntity.startAction();
  }

  _createChaiser(m, speed) {
    this._map.putCharacterAtRandom(m);
    const ai = new Chaser(m, this._player, this._map);
    m.setAction(()=>{ ai.action(); }, speed);
  }

  update() {
    for (let key in DirectionOfKey) {
      if (this._controller.pressed(key)) {
        this.movePlayer(DirectionOfKey[key]);
      }
    }
    this._display.clear();
    this._view.render(this._display);
  }

  movePlayer(direction) {
    const newCoordinate = this._player.coord.plus(direction);
    if (this._map.isOpenSpace(newCoordinate) == false) { return; }
    this._map.moveCharacter(this._player.coord, newCoordinate);
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
    this._display.setOptions({ width: 80, height: 24, bg: "black", fontFamily: "Courier New"});
    document.getElementById(screenID).appendChild(this._display.getContainer());
  }
}

new Game("screen");

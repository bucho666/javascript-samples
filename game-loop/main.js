"use strict";

class GameLoop {
  constructor(scene, fps = 60) {
    this.setScene(scene);
    this._interval = 1000 / fps;
  }

  setScene(newScene) {
    this._scene = newScene;
    if (this._scene !== undefined) {
      this._process = newScene.process();
    }
  }

  nextScene() {
    this.setScene(this._scene.nextScene());
  }

  run() {
    if (this._scene === undefined) return;
    this._scene.render();
    if (this._process.next().done) {
      this.nextScene();
    }
    setTimeout(() => {
      this.run();
    }, this._interval);
  }
}

class Scene {
  *waitFrame(frame) {
    while (frame--) {
      yield;
    }
  }
  *process() {}
  nextScene() {}
  render() {}
}

class TestScene2 extends Scene {
  *process() {
    console.log("this");
    yield* this.waitFrame(60);
    console.log("is");
    yield* this.waitFrame(60);
    console.log("testScene2");
    yield* this.waitFrame(60);
  }
}

class TestScene extends Scene {
  *waitFrame(frame) {
    for (let count = 0; count < frame; count++) {
      yield;
    }
  }
  *process() {
    console.log("hello");
    yield* this.waitFrame(60);
    console.log("my");
    yield* this.waitFrame(60);
    console.log("world");
    yield* this.waitFrame(60);
  }
  nextScene() {
    return new TestScene2();
  }
}

const game = new GameLoop(new TestScene(), 60);
game.run();

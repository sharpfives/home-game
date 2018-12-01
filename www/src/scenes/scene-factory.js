'use strict';

class SceneFactory {
  constructor() {
    // map of scene and corresponding state/gui
    this.scenes = {
      "base" : SceneBase,
      "intro" : IntroScene,
      "first" : FirstScene,
      "second" : SecondScene,
      "crater" : CraterScene,
      "cave" : CaveScene,
      "last" : LastScene,
      "credits" : CreditsScene
    }
  }

  makeScene(str) {
    if (typeof this.scenes[str] !== 'undefined') {
      let ObjType = this.scenes[str];
      return ObjType;
    }
    else {
      console.log(`no scene with type ${str} in scene factory`);
    }
  }
}

var sceneFactory = new SceneFactory();

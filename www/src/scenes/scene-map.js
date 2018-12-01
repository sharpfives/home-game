'use strict';

class SceneMap extends EventEmitter {
  constructor(game,player) {
    super();
    this.game = game;
    this.player = player;
    this.currentScene = undefined;
    this.scenes = {};
  }

  setup(data) {
    for(let d in data) {
      this[d] = data[d];
    }
  }

  async loadScene(name, entranceName) {
    // if (typeof this.currentScene !== 'undefined') {
    //   this.currentScene.hide();
    // }

    let scene = this.scenes[name];
    if (typeof scene === 'undefined') {
      console.log(`Loading scene '${name}'`);
      let sceneData = this.sceneData[name];
      if (typeof sceneData === 'undefined') {
        console.log(`no sceneData for name '${name}'`);
        return;
      }
      let sceneConfig = sceneData.config;
      let sceneTypeName = sceneData.type;
      let sceneClass = sceneFactory.makeScene(sceneTypeName);
      if (typeof sceneClass === 'undefined') {
        console.log(`unable to create scene of type ${sceneType}`);
        return;
      }
      // scene.game = this.game;
      // scene.type = sceneType;

      try {
        let data = await getJSON(sceneConfig);
        // this.game.cache.addJSON(scene.configName(), null, data);

        this.currentScene = sceneConfig;
        this.scenes[name] = data;
        // scene.name = name;
        this.emit('loaded-scene',name,sceneClass);

        if (typeof entranceName !== 'undefined')
          this.emit('enter',name,data,entranceName);
      }
      catch(e) {
        console.log(`unable to load scene data for ${name}, ${e}`);
      }

    }
    else {
      scene.didExit = false;
      if (typeof entranceName !== 'undefined') {
        this.emit('enter',name,scene,entranceName);
      }
    }
  }

  exit(sceneName,exitName) {
    let connections = this.connections;
    for( let c in connections) {
      let conn = connections[c];
      let from = conn.from;
      if (from.scene === sceneName && from.exit === exitName) {
        let to = conn.to;
        this.loadScene(to.scene, to.exit);
        return;
        // return this.emit('enter',to.scene, to.exit);
      }
    }

    for( let c in connections) {
      let conn = connections[c];
      let to = conn.to;
      if (to.scene === sceneName && to.exit === exitName) {
        let from = conn.from;
        this.loadScene(from.scene, from.exit);
        return;
      }
    }

    console.log(`no where to go from scene '${sceneName}' with exit '${exitName}'`);
  }

}

'use strict';

class MainGame extends Phaser.Game {
  constructor() {
    super(160, 120, Phaser.CANVAS, 'game-window');
    // stateManager.set(STATE_CURRENT_LEVEL_INDEX,0);
    // stateManager.set(STATE_ITEMS_IN_INVENTORY_QUANTITIES,{});
    // stateManager.load();


    let self = this;

    let sceneMap = new SceneMap(this,this.me);
    this.sceneMap = sceneMap;

    sceneMap.on('loaded-scene', (name, sceneType) => {
      // let sceneStateType = sceneFactory.makeSceneState(scene.type);
      this.state.add(name, sceneType, false);

    });

    sceneMap.on('enter',(sceneName, sceneData, exitName) => {
      this.state.states[sceneName].exitName = exitName;
      this.state.states[sceneName].sceneData = sceneData;
      this.state.start(sceneName, true, false);
    });

    let start = async () => {

      // let mapData = await getJSON('resources/config/master-map.json');
      // console.log('Loaded map');
      // console.log(JSON.stringify(mapData));
      // sceneMap.setup(mapData);
      //
      // let girlData = await getJSON('resources/images/characters/alien/animations.json');
      // this.cache.addJSON(Player.configName(), null, girlData);
      //
      // let ghostData = await getJSON('resources/images/characters/ghost/animations.json');
      // this.cache.addJSON(Ghost.configName(), null, ghostData);
      //
      // let clawData = await getJSON('resources/images/characters/pit-claw/animations.json');
      // this.cache.addJSON(PitClaw.configName(), null, clawData);
      //
      // let slimeData = await getJSON('resources/images/characters/ground-slime/animations.json');
      // this.cache.addJSON(GroundSlime.configName(), null, slimeData);
      //
      // let rocketData = await getJSON('resources/images/characters/rocket-ground/animations.json');
      // this.cache.addJSON(RocketGround.configName(), null, rocketData);
      //
      // let alienEndData = await getJSON('resources/images/characters/alien-end/animations.json');
      // this.cache.addJSON(AlienComic.configName(), null, alienEndData);
      //
      // let ghostEndData = await getJSON('resources/images/characters/ghost-end/animations.json');
      // this.cache.addJSON(GhostComic.configName(), null, ghostEndData);


    };

    // start();

    this.state.add('Preloader', PreLoadScreenState);
    this.state.start('Preloader');

  }





}

'use strict';

class PreLoadScreenState extends Phaser.State {
  constructor() {
    super();
  }

  preload() {
    this.load.image('loading-screen', 'resources/images/scenes/loading screen.png');

    this.game.load.json('master-map', 'resources/config/master-map.json');

    // let girlData = await getJSON('resources/images/characters/alien/animations.json');
    // this.cache.addJSON(Player.configName(), null, girlData);

    this.game.load.json(Player.configName(), 'resources/images/characters/alien/animations.json');

    // let ghostData = await getJSON('resources/images/characters/ghost/animations.json');
    // this.cache.addJSON(Ghost.configName(), null, ghostData);

    this.game.load.json(Ghost.configName(), 'resources/images/characters/ghost/animations.json');

    // let clawData = await getJSON('resources/images/characters/pit-claw/animations.json');
    // this.cache.addJSON(PitClaw.configName(), null, clawData);

    this.game.load.json(PitClaw.configName(), 'resources/images/characters/pit-claw/animations.json');

    // let slimeData = await getJSON('resources/images/characters/ground-slime/animations.json');
    // this.cache.addJSON(GroundSlime.configName(), null, slimeData);

    this.game.load.json(GroundSlime.configName(), 'resources/images/characters/ground-slime/animations.json');

    // let rocketData = await getJSON('resources/images/characters/rocket-ground/animations.json');
    // this.cache.addJSON(RocketGround.configName(), null, rocketData);

    this.game.load.json(RocketGround.configName(), 'resources/images/characters/rocket-ground/animations.json');

    // let alienEndData = await getJSON('resources/images/characters/alien-end/animations.json');
    // this.cache.addJSON(AlienComic.configName(), null, alienEndData);

    this.game.load.json(AlienComic.configName(), 'resources/images/characters/alien-end/animations.json');

    // let ghostEndData = await getJSON('resources/images/characters/ghost-end/animations.json');
    // this.cache.addJSON(GhostComic.configName(), null, ghostEndData);
    this.game.load.json(GhostComic.configName(), 'resources/images/characters/ghost-end/animations.json');

  }

  create() {

    let game = this.game;
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    this.game.stage.backgroundColor = '#343434';

    let mapData = this.game.cache.getJSON('master-map');
    console.log(JSON.stringify(mapData));
    this.game.sceneMap.setup(mapData);
  }

  update() {

    if (DEBUG_SCENE) {
      // sceneMap.exit('Intro','end');
      // sceneMap.loadScene('Ground Test','middle');
      // sceneMap.loadScene('Credits Scene','end');

      // sceneMap.loadScene('Intro','end');
      // sceneMap.loadScene('First Scene','ocean');
      this.game.sceneMap.loadScene('First Scene','rocket-temp');
      // sceneMap.loadScene('First Scene','fall-in');
      // sceneMap.loadScene('First Scene','cave');

      // sceneMap.loadScene('First Scene','right');
      // sceneMap.loadScene('Second Scene','right');
      // sceneMap.loadScene('Second Scene','factory-temp');
      // sceneMap.loadScene('Crater Scene','left');
      // this.game.sceneMap.loadScene('Last Scene','tower-temp');
      // sceneMap.loadScene('Last Scene','left');

      // sceneMap.loadScene('Cave Scene','top');
    }
    else {
      this.game.sceneMap.loadScene('Intro','end');

    }
  }
}

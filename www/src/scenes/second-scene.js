'use strict';

class SecondScene extends SceneBase {
  constructor() {
    super();

    this.cameraOffsets = [
      {
        x : 0,
        offset : [0, 20]
      },
      {
        x : 125,
        offset : [0, -5]
      },
      {
        x : 350,
        offset : [0, -10]
      },
      {
        x : 600,
        offset : [0, 0]
      }
    ];
  }

  preload() {
    super.preload();
    GroundSlime.loadResources(this.game);
    TowerArm.loadResources(this.game);

    if (DEBUG_SCENE) {
      stateManager.set(STATE_START_DID_FALL_IN,true);
      stateManager.set(STATE_HAS_BOOST,true);
      stateManager.set(STATE_HAS_DRILL,true);
      stateManager.set(STATE_HAS_DASH,true);
    }
  }

  create() {
    super.create();

    new TowerArm(this.game, 432, 178, 1);
    new TowerArm(this.game, 458, 90, 2);

    let me = this.game.me;
    me.setWheel();
    me.on('touched-slime', async (slimeObj) => {
      if (!this.didTouchSlime && !me.isDashing){
        this.didTouchSlime = true;
        tweenPromise(this.game, me.sprite.body, {x : slimeObj.sprite.body.x, y : slimeObj.sprite.body.y}, 300, 0, Phaser.Easing.Linear.None);
        setTimeout( () => {
          me.sprite.alpha = 0;
          // this.inputEnabled = false;
        }, 340);
        await slimeObj.snap();
        await this.savePlayer(me.x(),me.y(),43,220);
        me.sprite.body.setZeroVelocity();
        // this.inputEnabled = true;
        me.sprite.alpha = 1;
        this.didTouchSlime = false;
      }
    });
    // me.sprite.body.x = 40;
    // me.sprite.body.y = 100;

    // top on building
    this.addOrb(445, 19, 1);

    // deep pit
    this.addOrb(750, 435, 2);

    // smaller pit
    this.addOrb(738, 379, 3);

    // if (!stateManager.get(orbCollected(2))) {
    //   let p = new PowerOrb(this.game, 750, 430, 2);
    //   this.spriteContainer.addChild(p.sprite);
    // }
    //
    // if (!stateManager.get(orbCollected(3))) {
    //   let p = new PowerOrb(this.game, 738, 379, 3);
    //   this.spriteContainer.addChild(p.sprite);
    // }

    // if (!stateManager.get(orbCollected(8))) {
    //   let p = new PowerOrb(this.game, 375, 180, 8);
    //   this.spriteContainer.addChild(p.sprite);
    // }

    this.cursors = this.game.input.keyboard.createCursorKeys();

    let slimeLocs = [[170,299], [492,276], [720,437]];
    let slimes = [];
    for (let s in slimeLocs) {
      let loc = slimeLocs[s];
      let slime = new GroundSlime(this.game,loc[0],loc[1]);
      slime.setup({});
      this.spriteContainer.addChild(slime.sprite);
      // slime.playAnimation('snap');
      slimes.push(slime);

    }
    this.slimes = slimes;



    let background = this.spriteWithKey('background-parallax');
    let smokeStackLocs = [[137,253],[506,217], [699,238]];

    smokeStackLocs.forEach( (loc) => {
      let s = new SmokeStackCloud(this.game,loc[0],loc[1],background);
      s.start();
      background.addChild(s.sprite);
    });

    audioManager.stop(AUDIO_PATH_FIRST_SCENE);
    audioManager.play(AUDIO_PATH_SECOND_SCENE,1,true);
  }

  addOrb(x,y,num) {
    let orb = super.addOrb(x,y,num);
    if (typeof orb !== 'undefined') {
      orb.sprite.z = 104; // temp hack to put it underneath the diggable layer
      this.sortLayers();
    }
    return orb;
  }

  update() {
    super.update();
    this.slimes.forEach( (slime) => {
      slime.update();
    });
  }
}

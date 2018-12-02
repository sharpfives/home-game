'use strict';

class FirstScene extends SceneBase {
  constructor() {
    super();

    this.cameraOffsets = [
      {
        x : 0,
        offset : [-50,-10]
      },
      {
        x : 215,
        offset : [0,-30]
      },
      {
        x : 840,
        offset : [30,20]
      },
      {
        x : 940,
        offset : [0,20]
      }
    ];
  }

  static configName() {
    return 'un-named scene';
  }

  preload() {
    super.preload();
    this.game.load.image('wheel','resources/images/wheel.png');
    this.game.load.image('rocket-ground','resources/images/rocket-ground.png');
    this.game.load.image('sun','resources/images/scenes/sun.png');
    this.game.load.image('water-reflection','resources/images/scenes/water-reflection.png');
    this.game.load.image('particle','resources/images/square-particle-1x1.png');
    this.game.load.image('windmill-base-1','resources/images/windmill-base-1.png');
    this.game.load.image('windmill-base-2','resources/images/windmill-base-2.png');
    this.game.load.image('windmill-top-1','resources/images/windmill-top-1.png');
    this.game.load.image('windmill-top-2','resources/images/windmill-top-2.png');

    this.game.load.spritesheet('water-left','resources/images/scenes/water-left.png',250,61,21);
    this.game.load.spritesheet('light-bolts','resources/images/light-bolts.png',64,90,17);

    this.game.load.spritesheet('rocket-water','resources/images/rocket-water-liftoff.png',160,300,21);

    PitClaw.loadResources(this.game);
    AlienComic.loadResources(this.game);
    RocketGround.loadResources(this.game);
    GhostComic.loadResources(this.game);

    if (DEBUG_SCENE) {
      stateManager.set(STATE_DID_GET_WHEEL,true);
      stateManager.set(STATE_DID_OCEAN_SCENE,true);
      stateManager.set(STATE_START_DID_FALL_IN, true);
      stateManager.set(STATE_DID_ROCKET_LAND, true);
      stateManager.set(STATE_NUM_ORBS_IN_ROCKET,2);
      // stateManager.set(STATE_NUM_ORBS_FOLLOWING,1);
      stateManager.set(orbFollowing(9),true);
      // stateManager.set(orbFollowing(8),true);
      // stateManager.set(orbFollowing(7),true);
      // stateManager.set(orbFollowing(6),true);

      stateManager.set(STATE_DID_SEE_ROCKET_AREA,true);

      stateManager.set(STATE_HAS_BOOST,true);
      stateManager.set(STATE_HAS_DRILL,true);
      stateManager.set(STATE_HAS_DASH,true);

    }
  }

  create() {
    super.create();

    let alienComic = new AlienComic(this.game);
    alienComic.setup({});
    alienComic.sprite.alpha = 0;
    this.spriteContainer.addChild(alienComic.sprite);
    this.alienComic = alienComic;

    let ghostComic = new GhostComic(this.game);
    ghostComic.setup({});
    ghostComic.sprite.alpha = 0;
    this.spriteContainer.addChild(ghostComic.sprite);
    this.ghostComic = ghostComic;

    let sun = this.game.add.sprite(140,140,'sun');
    let parallax = this.spriteWithKey('parallax');
    parallax.addChild(sun);

    this.addWindmill(300,190,1);
    this.addWindmill(250,190,2);

    cameraController.isZoomFocused = false;


    // new LightBeam(this.game, 170, 150);

    let ocean = new OceanOverlay(this.game);
    this.spriteContainer.addChild(ocean.sprite);
    this.spriteContainer.addChild(ocean.reflection.sprite);


    if (!stateManager.get(STATE_DID_OCEAN_SCENE)) {
      let rocketWater = this.game.add.sprite(0,5,'rocket-water');
      rocketWater.animations.add('rest',[0],1,false).play();
      rocketWater.animations.add('liftoff',linearArray(0,20),11,false);
      this.rocketWater = rocketWater;
      this.spriteContainer.addChild(rocketWater);
    }

    let ghost = this.game.ghost;

    let me = this.game.me;
    if (stateManager.get(STATE_DID_GET_WHEEL))
      me.setWheel();
    else
      me.setNormal();

    me.on('ate-by-claw', async () => {

      if (this.atByClaw) {
        console.log('pit-claw done, returning')
        return;
      }

      me.sprite.alpha = 0;
      this.atByClaw = true;
      cameraController.isZoomFocused = true;

      if (!stateManager.get(STATE_EATEN_FIRST_TIME_BY_PIT)) {
        stateManager.set(STATE_EATEN_FIRST_TIME_BY_PIT,true);
        await sleep(2000);
        ghost.sprite.alpha = 1;
        ghost.sprite.body.x = 963;
        ghost.sprite.body.y = 142;
        ghost.faceLeft();
        await ghost.playAnimation('shock-face');
        await sleep(500);
        ghost.playAnimation('rest');
        await tweenPromise(this.game, ghost.sprite.body, {x : 930, y : 240}, 500, 0, Phaser.Easing.Linear.None);
      }
      else {
        await sleep(2000);
      }

      me.sprite.alpha = 1;
      let toCoord = (this.cameFromRight ? [this.game.world.width - 30, 130] : [885,130]);
      await this.savePlayer(930,240,toCoord[0],toCoord[1]);
      this.atByClaw = false;
    });

    me.on('touched-wheel', () => {
      // wheel.sprite.destroy();
      // me.setWheel();
      //
      // return;
      ghost.sprite.alpha = 0;

      let wheel = this.wheel;
      cameraController.isZoomFocused = true;
      cameraController.unfollow();

      wheel.sprite.destroy();
      me.setWheel();
      stateManager.set(STATE_DID_GET_WHEEL,true);
      audioManager.play(AUDIO_PATH_ALIEN_GET_WHEEL_FX,0.6);
      me.playAnimation('get-wheel').then( async () => {
        await this.wideScreen.hide();
        me.rest();
        cameraController.resetToPlayer();
        this.inputEnabled = true;
      });
    });

    let particleVent = () => {
      let xMax = 478;
      let xMin = 320;

      let timer = this.game.time.create(false);
      timer.loop(200, () => {
        let xVar = 10;
        let p = new CloudParticle(this.game, (xMin + (xMax - xMin) * Math.random()) + (xVar* Math.random() - xVar/2), 240, 0, -0.5, 'rgb(52,52,52)', 2 + Math.random() * 2);
        p.on('done', () => {
          p.sprite.destroy();
        });
      });
      timer.start();
    };

    // this.game.me.sprite.body.x = 750;
    // this.game.me.sprite.body.y = 150;

    // me.setWheel();

    particleVent();


    let rocket = new RocketGround(this.game);

    rocket.on('finished-row', async (row) => {

      // let thereFunc = async () => {
      //   await sleep(1000);
      let powerUp = new PowerUp(this.game, me.x(), me.y());

      if (row !== 3) {
        let ghost = this.game.ghost;
        ghost.playAnimation('concentrate');
        audioManager.stop(AUDIO_PATH_FIRST_SCENE);
        await sleep(1000);
        audioManager.play(AUDIO_PATH_ALIEN_POWER_UP_FX);
        powerUp.startParticles();
        await powerUp.doBolts();
        await sleep(1000);
        ghost.sprite.z = 204;
        this.alienComic.sprite.alpha = 1;
        this.alienComic.sprite.cameraOffset.x = this.game.width/2;
        this.alienComic.sprite.cameraOffset.y = this.game.height/2;
        this.alienComic.sprite.z = 205;
        this.sortLayers();
        this.alienComic.shake(1);


      }


      switch(row) {
        case 0 :
          // ghost.startBounce();
          await this.alienComic.playAnimation('powerup-boost');
          powerUp.stopParticles();
          ghost.playAnimation('rest');
          await sleep(3000);
          this.alienComic.sprite.alpha = 0;
          audioManager.play(AUDIO_PATH_FIRST_SCENE,1,true);

          await ghost.playAnimation('to-two-up-arrows');
          await sleep(1000);
          me.hasBoost = true;
          stateManager.set(STATE_HAS_BOOST, true);
          break;
        case 1 :

          await this.alienComic.playAnimation('powerup-drill');
          powerUp.stopParticles();
          ghost.playAnimation('rest');
          await sleep(3000);
          this.alienComic.sprite.alpha = 0;
          audioManager.play(AUDIO_PATH_FIRST_SCENE,1,true);
          // ghost.sprite.alpha  = 1;
          ghost.faceRight();
          await ghost.playAnimation('to-up-down-arrows');
          await sleep(1000);
          me.hasDrill = true;
          stateManager.set(STATE_HAS_DRILL, true);
          break;
        case 2 :

          await this.alienComic.playAnimation('powerup-dash');
          powerUp.stopParticles();
          ghost.playAnimation('rest');
          await sleep(3000);
          this.alienComic.sprite.alpha = 0;
          audioManager.play(AUDIO_PATH_FIRST_SCENE,1,true);

          ghost.faceRight();
          await ghost.playAnimation('to-two-right-arrows');
          await sleep(1000);
          me.hasDash = true;
          stateManager.set(STATE_HAS_DASH, true);
          break;
        case 3 :
          await this.doGoodbyeScene();
          await sleep(1000);
          // await rocket.takeoff();
          break;
      }

      await this.wideScreen.hide();
      this.inputEnabled = true;

    });

    rocket.setup({});
    this.spriteContainer.addChild(rocket.sprite);
    this.rocket = rocket;
    // rocket.land();

    me.on('at-rocket-exit', async () => {
      this.ignoreCameraOffset = false;
    });

    me.on('at-rocket-enter', async () => {
      this.ignoreCameraOffset = true;

      cameraController.cameraOffsetX = 0;
      cameraController.cameraOffsetY = 0;

      if (this.isAddingOrbs) {
        return;
      }

      let orbs = me.followingOrbs;

      if (orbs.length > 0) {
        this.isAddingOrbs = true;
      }

      // await sleep(1000);
      for (let o in orbs) {
        let orb = orbs[o];
        orb.stopFollow();
        stateManager.set(orbFollowing(orb.number),false);

        let orbSprite = orb.sprite;
        let nextOrbInfo = rocket.nextOrbInfo();
        let thereFunc = async () => {
          audioManager.play(AUDIO_PATH_ORB_TO_ROCKET_FX,0.8);
          await tweenPromise(this.game, orbSprite.body, {x : this.rocket.sprite.body.x + nextOrbInfo.coords[0], y : this.rocket.sprite.body.y + nextOrbInfo.coords[1]}, 2000);
          await rocket.addOrb();
        };
        if (nextOrbInfo.isFinishedRow) {
          this.inputEnabled = false;
          me.rest();
          me.sprite.body.x = 724;
          me.sprite.body.y = 135;

          let ghost = this.game.ghost;

          ghost.faceLeft();
          await this.wideScreen.show();
          ghost.sprite.alpha = 1;
          ghost.sprite.body.x = me.x() + 20;
          ghost.sprite.body.y = me.y();
          ghost.appear();
          await sleep(1000);
          await thereFunc();
        }
        else {
          await thereFunc();
        }

      }
      for (let o in orbs) {
        orbs[o].sprite.destroy();
      }
      stateManager.set(STATE_NUM_ORBS_FOLLOWING,0);
      me.followingOrbs = [];

      this.isAddingOrbs = false;
    });

    // rocket.addOrb();
    // rocket.addOrb();

    if (!stateManager.get(STATE_DID_GET_WHEEL)) {
      let wheel = new Wheel(this.game, 541, 190);
      this.wheel = wheel;
    }

    // new GrassBlade(this.game,300,190);
    let grassPatch3 = new GrassPatch(this.game, 294, 207, 10, this.spriteContainer);
    let grassPatch1 = new GrassPatch(this.game, 218, 230, 20, this.spriteContainer);
    let grassPatch2 = new GrassPatch(this.game, 180, 240, 10, this.spriteContainer);

    let pc = new PitClaw(this.game);
    pc.setup({});
    this.spriteContainer.addChild(pc.sprite);
    this.pitclaw = pc;

    // this.spriteContainer.addChild(grassPatch.sprite);

    if (!stateManager.get(STATE_START_DID_FALL_IN)) {

      this.doFallInScene().then( async () => {
        await sleep(8000);
        this.doWheelPushInScene();
      });


      let intro = async () => {

        return;

        // ask ghost question
        let ghost = this.game.ghost;
        ghost.sprite.body.x = 383;
        ghost.sprite.body.y = 190;

        await sleep(2000);

        // await this.testIntro();
        return;


        // });
      };
      intro();
    }


    if (!stateManager.get(orbCollected(0)) && stateManager.get(STATE_DID_ROCKET_LAND)) {
      let orb = new PowerOrb(this.game, 807, 45, 0);
      this.orb = orb;
    }

    new RocketLandingCollisionArea(this.game);

    audioManager.stop(AUDIO_PATH_CAVE_SCENE);
    audioManager.stop(AUDIO_PATH_SECOND_SCENE);
    audioManager.stop(AUDIO_PATH_INTRO);
    audioManager.play(AUDIO_PATH_FIRST_SCENE,1,true);
    audioManager.play(AUDIO_PATH_OCEAN_FX,1,true);

    // setTimeout( () => {
    //   rocket.takeoff();
    // },4000);

    this.cameFromRight = (this.exitName === 'right');
  }

  async doGoodbyeScene() {
    let me = this.game.me;
    let ghost = this.game.ghost;

    this.inputEnabled = false;
    this.ignoreCameraOffset = true;


    let doorPieces = this.rocket.showDoor();
    let doorBack = doorPieces[0];
    let door = doorPieces[1];

    this.spriteContainer.addChild(doorBack);
    this.spriteContainer.addChild(door);
    doorBack.z = 98;
    door.z = 100;
    me.sprite.z = door.z + 1;

    ghost.sprite.z = 199;

    this.sortLayers();

    await sleep(1000);
    // me.sprite.velocity.x = -me.wheelVelocity;
    // me.moveLeft();
    audioManager.stop(AUDIO_PATH_FIRST_SCENE);
    await me.wheelJump();
    await tweenPromise(this.game, me.sprite.body, {x : door.body.x}, 500, 0, Phaser.Easing.Linear.None);

    cameraController.cameraOffsetX = 30;
    cameraController.cameraOffsetY = 0;

    me.faceRight();
    // me.setNormal();

    await sleep(2000);

    audioManager.play(AUDIO_PATH_GOODBYE_SCENE,1,true);
    await sleep(2000);

    audioManager.play(AUDIO_PATH_RUMBLE_FX,1,true);
    cameraController.shakeForever(3);
    // let box = new ComicBox(this.game,32,32,64,64);

    let alienComic = this.alienComic;
    alienComic.sprite.alpha = 1;
    alienComic.sprite.z = 200;
    // alienComic.sprite.bringToTop();
    this.sortLayers();
    alienComic.sprite.cameraOffset.x = 48;
    alienComic.sprite.cameraOffset.y = 56;
    alienComic.shake(1);

    // alien.sprite.fixedToCamera   = true;
    // await sleep(1000);
    await alienComic.playAnimation('turn');
    alienComic.playAnimation('rest');
    await sleep(3000);


    let ghostEnd = this.ghostComic;
    ghostEnd.sprite.cameraOffset.x = 110;
    ghostEnd.sprite.cameraOffset.y = 75;
    ghostEnd.sprite.z = 201;
    this.sortLayers();
    ghostEnd.sprite.alpha = 1;
    // ghostEnd.sprite.bringToTop();
    ghostEnd.shake(1);

    ghostEnd.sprite.bringToTop();
    ghostEnd.playAnimation('rest');
    await sleep(2000);
    await ghostEnd.playAnimation('moon');
    ghostEnd.playAnimation('rest');

    await sleep(1500);

    await alienComic.playAnimation('smile');
    alienComic.playAnimation('rest');
    await sleep(3000);
    await alienComic.playAnimation('heart');
    alienComic.playAnimation('rest');

    await sleep(1500);

    await ghostEnd.playAnimation('heart');
    ghostEnd.playAnimation('rest');

    await sleep(2000);

    await alienComic.playAnimation('wave');
    alienComic.playAnimation('rest');

    await sleep(2000);

    ghostEnd.sprite.destroy();
    alienComic.sprite.destroy();

    await sleep(4000);

    me.sprite.z = door.z - 1;
    ghost.sprite.z = 199;
    this.sortLayers();
    door.play('close');

    await sleep(3000);

    me.sprite.alpha = 0;
    door.destroy();
    doorBack.destroy();

    // cameraController.cameraOffsetX = 0;
    cameraController.cameraOffsetY = -20;

    await this.rocket.takeoff();
    await ghost.disappear();
    await this.fadeOut('up');
    this.game.sceneMap.exit(this.sceneData.name, 'end');
  }

  async doWheelPushInScene() {
    // focus on wheel
    let me = this.game.me;

    this.inputEnabled = false;
    await this.wideScreen.show();
    me.rest();
    audioManager.stop(AUDIO_PATH_ALIEN_GROUND_SCOOT_FX,50);
    await me.cry();
    let wheel = this.wheel;
    let ghost = this.game.ghost;
    ghost.sprite.body.x = wheel.sprite.body.x + 6;
    ghost.sprite.body.y = 200;

    await cameraController.focusAndZoom(wheel);
    await sleep(2000);
    ghost.faceLeft();
    ghost.sprite.alpha = 1;
    await ghost.appear();
    await sleep(1000);
    await ghost.playAnimation('kneel-in');
    await ghost.playAnimation('push-wheel');
    wheel.push(-50);
    cameraController.isZoomFocused = false;
    cameraController.follow(wheel);

    // this.cinematicZoomFocus(ghost,this.testIntro,this,1000);

  }

  async doFallInScene() {
    let me = this.game.me;
    let ghost = this.game.ghost;

    this.wideScreen.show();

    // intro falling
    this.inputEnabled = false;

    me.playAnimation('fall');
    await sleep(2000);
    me.playAnimation('flat');
    cameraController.shake(1000);
    let centerX = 360;
    let centerY = 140;
    let mushroomCloud = new MushroomCloud(this.game,centerX,centerY);
    audioManager.play(AUDIO_PATH_EXPLOSION_FX);
    mushroomCloud.start();
    await sleep(6000);
    await me.playAnimation('rise');
    await sleep(1000);
    await me.playAnimation('shake-head');
    await sleep(1000);
    me.faceRight();
    await sleep(500);
    me.faceLeft();
    await sleep(500);
    me.faceRight();
    await sleep(500);
    me.faceLeft();
    await me.cry();
    await sleep(1000);

    ghost.sprite.body.x = me.x() - 20;
    ghost.sprite.body.y = me.y() - 5;
    ghost.sprite.alpha = 1;
    ghost.faceRight();
    ghost.startBounce();
    await ghost.appear();
    await sleep(1000);
    await me.askMoonQuestion(1000);
    await sleep(1000);
    setTimeout( () => {
     ghost.sprite.body.velocity.x = 140;
     ghost.sprite.body.velocity.y = -10;
   }, 200);
   ghost.stopBounce();
   await ghost.dash();
   setTimeout( () => {
     ghost.sprite.alpha = 0;
     ghost.sprite.body.velocity.x = 0;
     ghost.sprite.body.velocity.y = 0;
     // ghost.sprite.body.setZeroVelocity();
   },3000);
    await this.wideScreen.hide();

    // stateManager.on(STATE_START_DID_FALL_IN, (val) => {
    this.inputEnabled = true;
    stateManager.set(STATE_START_DID_FALL_IN,true);
  }


  async doAskQuestionScene() {

    let ghost = this.game.ghost;

    let me = this.game.me;
    me.playAnimation('rest-walk');
    await sleep(2000);
    ghost.sprite.alpha = 1;

    // cameraController.focusAndZoom(ghost);
    await ghost.appear();
    ghost.playAnimation('rest');
    ghost.startBounce();
    ghost.startParticles();
    await sleep(1000);

    await me.playAnimation('to-moon-start');
    await sleep(1000);
    await me.playAnimation('to-moon-end');
    me.playAnimation('rest-walk');

    ghost.stopParticles();
    await ghost.playAnimation('to-up-arrow-start');
    await sleep(1000);
    ghost.startParticles();
    await ghost.playAnimation('to-up-arrow-end');
    await sleep(1000);
    ghost.stopParticles();
    await ghost.disappear();

  }

  async doOceanScene() {
    this.inputEnabled = false;
    await this.wideScreen.show();
    let me = this.game.me;
    let ghost = this.game.ghost;
    ghost.sprite.body.x = 160;
    ghost.sprite.body.y = 220;

    me.faceLeft();
    await tweenPromise(this.game, me.sprite.body, {x : 170}, 500, 0, Phaser.Easing.Linear.None);
    me.rest();
    // me.sprite.body.x = 170;
    await sleep(1000);
    ghost.sprite.alpha = 1;
    ghost.startBounce();
    ghost.faceRight();
    await ghost.appear();
    await sleep(500);
    await me.askMoonQuestion(500);
    await sleep(1000);
    ghost.faceLeft();
    audioManager.stop(AUDIO_PATH_FIRST_SCENE);
    await sleep(1000);
    audioManager.play(AUDIO_PATH_PULL_ROCKET_FX);
    await ghost.playAnimation('concentrate');
    await cameraController.shake(3000,2);
    this.rocketWater.play('liftoff');
    await sleep(2000);
    cameraController.isZoomFocused = true;
    let prevCamX = this.game.camera.view.centerX;
    let prevCamY = this.game.camera.view.centerY;

    await tweenPromise(this.game, this.game.camera.view, {centerX : this.rocket.sprite.body.x, centerY : 50}, 2000);
    cameraController.isZoomFocused = false;
    cameraController.currentItem = this.rocket;
    await sleep(1000);
    await this.rocket.land();
    audioManager.play(AUDIO_PATH_FIRST_SCENE,1,true);
    this.rocketWater.destroy();
    ghost.playAnimation('rest');
    ghost.faceRight();
    me.faceRight();
    await sleep(2000);
    cameraController.isZoomFocused = true;
    cameraController.currentItem = undefined;
    await tweenPromise(this.game, this.game.camera.view, {centerX : prevCamX, centerY : prevCamY}, 2000);
    await sleep(500);
    await ghost.disappear();
    cameraController.isZoomFocused = false;
    stateManager.set(STATE_DID_OCEAN_SCENE,true);
    await this.wideScreen.hide();

    let orb = new PowerOrb(this.game, 807, 45, 0);
    this.orb = orb;

    this.inputEnabled = true;
  }

  async fadeIn(exitName) {
    this.game.stage.backgroundColor = '#a7a7a7';
    if (exitName !== 'fall-in') {
      let t = new CloudTransition(this.game);
      this.spriteContainer.addChild(t.sprite);
      await t.fadeOut(exitName);
    }
  }

  async focusOnFirstOrb() {
    this.inputEnabled = false;
    this.wideScreen.show();
    cameraController.isZoomFocused = true;
    let prevCamX = this.game.camera.view.centerX;
    let prevCamY = this.game.camera.view.centerY;
    await tweenPromise(this.game, this.game.camera.view, {centerX : this.orb.sprite.body.x, centerY : this.orb.sprite.body.y}, 2000);
    await sleep(2000);
    this.wideScreen.hide();
    await tweenPromise(this.game, this.game.camera.view, {centerX : prevCamX, centerY : prevCamY}, 2000);
    // cameraController.resetToPlayer();
    cameraController.isZoomFocused = false;
    this.inputEnabled = true;
  }

  addWindmill(x,y,number) {
    let baseName = 'windmill-base-' + number;
    let topName = 'windmill-top-' + number;

    let topOffset = [0,0];
    switch(number) {
      case 1:
        topOffset = [10,0];
        break;
      case 2:
        topOffset = [20,0];
        break;
    }
    let base = this.game.make.sprite(x,y,baseName);
    let top = this.game.make.sprite(x + topOffset[0],y + topOffset[1],topName);
    top.anchor.setTo(0.5,0.5);
    // top.angularVelocity = 1;


    let timer = this.game.time.create(false);
    timer.loop(100, () => {
      top.rotation += (1*Math.PI/180);
    });
    timer.start();

    let parallax = this.spriteWithKey('parallax');
    parallax.addChild(base);
    parallax.addChild(top);

    // return [base, top];

  }

  update() {
    super.update();

    let me = this.game.me;

    let distToOcean = me.x() - 160;
    audioManager.setVolume(AUDIO_PATH_OCEAN_FX,Math.min(1,40/(distToOcean + 40)));

    if (!this.isDoingOceanScene && me.sprite.body.x < 180 && stateManager.get(STATE_DID_GET_WHEEL) && !stateManager.get(STATE_DID_OCEAN_SCENE)) {
      this.isDoingOceanScene = true;
      this.doOceanScene();
    }

    if (me.mode === MODE_NORMAL) {
      me.sprite.body.x = Math.min(me.sprite.body.x, 465);
      me.sprite.body.x = Math.max(me.sprite.body.x, 376);
    }
    else {
      me.sprite.body.x = Math.max(me.sprite.body.x, 170);
    }


    if (me.y() > this.game.world.height) {
      if (me.x() > 382 && me.x() < 457) {
        console.log('WE GOIN DOWNNN');
        this.game.sceneMap.exit(this.sceneData.name, 'cave');
      }
      else if (!this.atByClaw){
        let save = async () => {
          let toCoord = (this.cameFromRight ? [this.game.world.width - 30, 130] : [885,130]);
          await this.savePlayer(me.x(),me.y(),toCoord[0],toCoord[1]);
          me.rest();
          if (this.cameFromRight)
            me.faceLeft();
          else
            me.faceRight();
        };
        save();
      }
    }

    // else if( me.x() > 800 && me.y() > this.game.world.height && !this.isSaving) {
    //   this.isSaving = true;
    //   this.savePlayer(930,160,885,130).then( () => {
    //     this.isSaving = false;
    //   });
    // }
    else if (me.sprite.body.x > 910 && me.sprite.body.x < 950) {
      if (!this.pitClawDidSnap) {
        this.pitClawDidSnap = true;
        this.pitclaw.snap();
      }
      this.pitClawDidSnap = true;
    }
    else if (me.sprite.body.x > 757 && stateManager.get(STATE_DID_OCEAN_SCENE) && !stateManager.get(STATE_DID_SEE_ROCKET_AREA)) {
      stateManager.set(STATE_DID_SEE_ROCKET_AREA, true);
      this.focusOnFirstOrb();
    }
    else {
      this.pitClawDidSnap = false;
    }
  }
}

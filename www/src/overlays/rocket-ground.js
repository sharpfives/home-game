'use strict';

class RocketGround extends LayeredCharacter {
  constructor(game) {
    super(game);
    this.orbRows = [1,2,3,4];

    this.coordsForOrbs = [];
    let startX = 10;
    let startY = 17;
    let xInc = -4;
    let yInc = -5;
    let count = 0;
    for(let i = 0; i < this.orbRows.length; i++) {
      let numOrbsInRow = this.orbRows[i];
      for(let j = 0; j < numOrbsInRow; j++) {
        this.coordsForOrbs[count++] = [startX + j*xInc, startY + i*yInc];
      }
    }
  }

  static loadResources(game) {
    super.loadResources(game);
    game.load.image('particle-2x3','resources/images/particle-2x3.png');
    game.load.image('particle-2x2','resources/images/square-particle-2x2.png');
    game.load.image('rocket-door-back','resources/images/rocket-door-back.png');
    game.load.spritesheet('rocket-door','resources/images/rocket-door.png',11,20,9);

  }

  static configName() {
    return 'rocket-ground';
  }

  setup(data) {
    super.setup(data);
    let numOrbsCollected = stateManager.get(STATE_NUM_ORBS_IN_ROCKET,0);
    let orbRows = this.orbRows;

    let totalRowOrbThreshold = this.orbRows[0];
    let rowIndex = 0;

    let pieces = [
      'bottom',
      'top',
      'right-wing',
      'left-wing',
      'inlay-left-wing',
      'inlay-right-wing',
      'inlay-bottom',
      'inlay-top'
    ];
    pieces.forEach( async (p) => {
      await this.playAnimationOnLayer(this.layerWithKey(p),'broken');
    });

    for(let i = 0; i < numOrbsCollected; i++) {

      let coords = this.coordsForOrbs[i];
      let p = this.game.add.sprite(coords[0],coords[1],'particle-2x3');
      p.anchor.setTo(0.5,0.5);
      this.game.physics.p2.enable(p, DEBUG_SPRITE_POLYGONS);
      p.body.clearShapes();
      p.body.static = true;
      this.sprite.addChild(p);


      if ( (i+1) >= totalRowOrbThreshold) {
        console.log("DONE ROW " + rowIndex);

        totalRowOrbThreshold += orbRows[rowIndex+1];

        this.finishRow(rowIndex);
        rowIndex++;
      }
    }

    this.sprite.body.x = 700;
    if (stateManager.get(STATE_DID_ROCKET_LAND)) {
      this.setLanded();
    }
    else {
      this.sprite.body.y = 0;
      this.sprite.alpha = 0;
    }
  }

  async finishRow(index,trigger) {
    trigger = (typeof trigger === 'undefined' ?  false : trigger);
    let piece = '';
    switch(index) {
      case 0:
        piece = 'right-wing';
        break;
      case 1:
        piece = 'bottom';
        break;
      case 2:
        piece = 'left-wing';
        break;
      case 3:
        piece = 'top';
        break;
    }

    if (piece !== '') {
      let inlayName = 'inlay-' + piece;
      let inlay = this.layerWithKey(inlayName);
      inlay.bringToTop();
      this.playAnimationOnLayer(this.layerWithKey(piece),'fix');
      if (trigger)
        audioManager.play(AUDIO_PATH_ROCKET_FIX_PART_FX);
      await this.playAnimationOnLayer(inlay,'fix');
      this.playAnimationOnLayer(inlay,'fixed');
      this.playAnimationOnLayer(this.layerWithKey(piece),'fixed');

    }


    if (trigger)
      await this.emit('finished-row',index);
  }

  async addOrb() {

    let orbRows = this.orbRows;

    let numOrbsCollected = stateManager.get(STATE_NUM_ORBS_IN_ROCKET,0);
    let rowIndex = 0;
    let totalRowOrbs = orbRows[rowIndex];
    for(let i = 0; i < numOrbsCollected; i++) {
      if ( (i+1) >= totalRowOrbs) {
        totalRowOrbs += orbRows[rowIndex+1];
        rowIndex++;
      }
    }

    let newNum = numOrbsCollected + 1;

    let coords = this.coordsForOrbs[numOrbsCollected];
    let p = this.game.add.sprite(coords[0],coords[1],'particle-2x3');
    p.anchor.setTo(0.5,0.5);
    this.game.physics.p2.enable(p, DEBUG_SPRITE_POLYGONS);
    p.body.clearShapes();
    p.body.static = true;
    this.sprite.addChild(p);

    if (newNum >= totalRowOrbs) {
      await this.finishRow(rowIndex,true);
    }

    stateManager.set(STATE_NUM_ORBS_IN_ROCKET,newNum);
  }

  nextOrbInfo() {
    let numOrbsCollected = stateManager.get(STATE_NUM_ORBS_IN_ROCKET,0);
    let rowIndex = 0;
    let orbRows = this.orbRows;
    let totalRowOrbs = orbRows[rowIndex];
    for(let i = 0; i < numOrbsCollected; i++) {
      if ( (i+1) >= totalRowOrbs) {
        totalRowOrbs += orbRows[rowIndex+1];
        rowIndex++;
      }
    }


    let coords = this.coordsForOrbs[numOrbsCollected];

    let newNum = numOrbsCollected + 1;

    return {
      coords : coords,
      rowIndex : rowIndex,
      isFinishedRow : newNum >= totalRowOrbs
    };
  }

  setLanded() {
    this.sprite.alpha = 1;
    this.sprite.body.x = 700;
    this.sprite.body.y = 128;
  }

  async land() {

    this.sprite.alpha = 1;
    this.sprite.body.y = 0;

    // this.playAnimationOnLayer(this.layerWithKey('right-wing'),'on');
    await tweenPromise(this.game, this.sprite.body, {y : 128}, 500, 0, Phaser.Easing.Linear.None);

    let numParticles = 30;
    let vMax = 2;
    for(let k = 0; k < numParticles; k++) {
      let vx = Math.random() * vMax * 2 - vMax;
      let p = new ShrinkCloudParticle(this.game,this.sprite.body.x + this.sprite.width/2 - 20, this.sprite.body.y + this.sprite.height + 20, vx, 0, undefined, 20, 0.2 + Math.random()/2);
      p.on('end', () => {
        p.sprite.destroy();
      });
      p.start();
    }

    stateManager.set(STATE_DID_ROCKET_LAND,true);
    audioManager.play(AUDIO_PATH_ROCKET_LAND_FX,0.5);
    await cameraController.shake(1000,3);
  }

  async takeoff() {

    let timer = this.game.time.create(false);
    timer.loop(100, () => {
      let numParticles = 3;
      let vMax = 2;
      for(let k = 0; k < numParticles; k++) {
        let vx = vMax*rand(-1,1);
        let vy = rand(3,5);
        let p = new ShrinkCloudParticle(this.game,this.sprite.body.x + this.sprite.width/2 - 15, this.sprite.body.y + this.sprite.height + 20, vx, vy, undefined, 20, 0.2 + Math.random()/2);
        p.on('end', () => {
          p.sprite.destroy();
        });
        p.start();
      }
    });
    timer.start();

    cameraController.shakeForever(3);
    audioManager.play(AUDIO_PATH_ROCKET_LAUNCH_FX);
    await tweenPromise(this.game, this.sprite.body, {y : -100}, 5000, 0, Phaser.Easing.Linear.None);
    timer.stop();
    cameraController.stopShaking();
  }

  showDoor() {
    let doorX = this.sprite.body.x + 7;
    let doorY = this.sprite.body.y - 10;
    let back = this.game.add.sprite(doorX,doorY,'rocket-door-back');
    back.anchor.setTo(0.5,0.5);
    let door = this.game.add.sprite(doorX,doorY,'rocket-door');
    door.type = 'platform';
    door.animations.add('open',linearArray(0,8),15,false);
    door.animations.add('close',linearArray(8,0),15,false);
    door.play('open');
    this.game.physics.p2.enable(door, DEBUG_SPRITE_POLYGONS);
    door.body.clearShapes();
    door.body.addRectangle(door.width, 5, 0, door.height/2);
    door.body.static = true;

    return [back, door];
    // this.sprite.addChild(back);

  }
}

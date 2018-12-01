'use-strict';

class Player extends SimpleCharacter {
  constructor(game) {
    super(game);

    this.name = 'player';

    this.followingOrbs = [];

    this.hasBoost = false;
    this.hasDash = false;
    this.hasDrill = false;
    this.jumpTime = 0;

    let lastGroundTimeHit = 0;
    this.lastLeftTime = 0;
    this.lastRightTime = 0;
    this.dashThresholdTime = 200;

    let s = this.game.add.sprite(0,0,'dash-flame');
    s.animations.add('on',linearArray(0,4),15,false);
    s.animations.add('off',[4],15,false);
    s.alpha = 0;
    this.dashFlame = s;

    let bodyLayerName = this.constructor.getLayerName('body');

    this.collisionBeginHandlers[bodyLayerName] = async (sprite) => {
      if (sprite.type === 'wheel') {
        console.log("HIT DA WHEEEEEl");
        this.emit('touched-wheel');
        // await sleep(1000);
      }
      else if(sprite.type === 'church-tower') {
        this.emit('hit-church-tower', sprite.obj);
      }
      else if(sprite.type === 'rocket-collision-area') {
        this.emit('at-rocket-enter');
      }
      else if (sprite.type === 'pit-claw') {
        console.log('NOM NOM NOM');
        this.emit('ate-by-claw');
      }
      else if (sprite.type === 'ground-slime') {
        console.log('SLIIIIIIME');
        this.emit('touched-slime',sprite.obj);
      }
      else if (sprite.type === 'big-rock') {
        console.log('ROCK!!!!');
        this.emit('hit-rock');
      }
      else if (sprite.type === 'power-orb') {
        let obj = sprite.obj;
        if (!obj.isFollowing) {
          audioManager.play(AUDIO_PATH_ORB_ACQUIRE_FX,0.3);
          obj.startFollow(7 + this.followingOrbs.length*5);
          this.followingOrbs.push(obj);
          let numOrbs = stateManager.get(STATE_NUM_ORBS_FOLLOWING);
          numOrbs = (typeof numOrbs !== 'undefined' ? numOrbs : 0);
          stateManager.set(STATE_NUM_ORBS_FOLLOWING,numOrbs + 1);
          stateManager.set(orbFollowing(obj.number),true);
        }
        stateManager.set(orbCollected(obj.number),true);
        obj.isFollowing = true;

      }
      else if (sprite.type === 'ground' || sprite.type === 'platform') {

        if (!stateManager.get(STATE_START_DID_FALL_IN)) {
          // await this.playAnimation('wheel-jump-end');
          // this.playAnimation('flat');
          return;
        }
        let timeNow = new Date().getTime();

        // this.isJumping = false;

        // console.log('BEGIN HIT GROUND');

        if (!this.isDashing && timeNow - this.jumpTime > 200 && !this.isPlayingAnimation('get-wheel') && timeNow - lastGroundTimeHit > 200) {
          this.isJumping = false;

          if (this.mode === MODE_WHEEL && this.sprite.body.velocity.y > 20) {
            await this.land();
          }
        }
        lastGroundTimeHit = timeNow;

        // }
        audioManager.stop(AUDIO_PATH_ALIEN_DRILL_MIDDLE_FX,400);
        this.isDrilling = false;
        this.isRocketing = false;
        // this.isJumping = false;

      }
      else if( sprite.type === 'breakable') {
        if (this.isDrilling) {
          let numParticles = 2;
          for(let k = 0; k < numParticles; k++) {
            let c = new CloudParticle(this.game,sprite.body.x,sprite.body.y, Math.random() - 0.5 ,-1 - 2 * Math.random());
            c.sprite.z = this.sprite.z - 1;
          }

          sprite.destroy();
          cameraController.shake(200);
          audioManager.play(AUDIO_PATH_GROUND_BREAK_FX,0.7);
        }
        else {
          // this.isOffGround = false;
        }

        this.isRocketing = false;
        this.isJumping = false;

      }


    };

    this.collisionEndHandlers[bodyLayerName] = async (sprite) => {
      // if (sprite.type === 'ground' || sprite.type === 'breakable') {
      //   console.log('END HIT GROUND');
      //   this.isOffGround = true;
      // }
      if (sprite.type === 'rocket-collision-area') {
        this.emit('at-rocket-exit');
      }
    };

    // this.mode = MODE_WHEEL;
    this.mode = MODE_NORMAL;

    this.walkVelocity = 20;
    this.wheelVelocity = 35;
  }

  async land() {
    cameraController.shake(50,1);
    let numDustParticles = 8;
    let x = this.x(); let y = this.y();
    for(let k = 0; k < numDustParticles; k++) {
      let p = new CloudParticle(this.game, x, y + 8, 1*rand(-1,1), rand(-0.1,-0.3), 'rgb(52,52,52)', rand(2,4));
      p.on('done', () => {
        p.sprite.destroy();
      });
    }
    audioManager.play(AUDIO_PATH_ALIEN_LAND_FX,0.2);
    await this.playAnimation('wheel-jump-end');
    if (Math.abs(this.sprite.body.velocity.x) > 1) {
      this.move();
    }
    else {
      this.rest();
    }
  }

  rest() {
    if (this.mode === MODE_WHEEL) {
      this.playAnimation('rest-wheel');
      audioManager.stop(AUDIO_PATH_WHEEL_SQUEAK_FX,50);
    }
    else if (this.mode === MODE_NORMAL) {
      this.playAnimation('rest-walk');
      audioManager.stop(AUDIO_PATH_ALIEN_GROUND_SCOOT_FX,50);
    }
    this.sprite.body.velocity.x = 0;
  }

  static configName() {
    return 'player';
  }

  hitBreakableBrick(brickSprite) {
    if (this.isDrilling) {
      let numParticles = 2;
      for(let k = 0; k < numParticles; k++) {
        let c = new CloudParticle(this.game,brickSprite.body.x,brickSprite.body.y, Math.random() - 0.5 ,-1 - 2 * Math.random());
        c.sprite.z = this.sprite.z - 1;
      }

      brickSprite.destroy();
      cameraController.shake(200);
    }
  }

  async wheelJump() {
    if (!this.isOffGround && this.mode === MODE_WHEEL) {
      this.isJumping = true;
      audioManager.play(AUDIO_PATH_ALIEN_JUMP_FX,0.3);
      await this.playAnimation('wheel-jump-start');
      this.sprite.body.velocity.y = -120;
    }
  }

  async askMoonQuestion(time) {
    audioManager.play(AUDIO_PATH_ALIEN_QUESTION_IN_FX,0.8);
    await this.playAnimation('to-moon-start');
    await sleep(time);
    audioManager.play(AUDIO_PATH_ALIEN_QUESTION_OUT_FX,0.8);
    await this.playAnimation('to-moon-end');
    this.rest();
  }

  setup(data) {
    super.setup(data);

    this.setNormal();

    this.sprite.key = 'player';
    this.sprite.type = 'player';
    this.sprite.body.mass = 0.1;
    this.sprite.body.fixedRotation = true;

    this.hasBoost = stateManager.get(STATE_HAS_BOOST);
    this.hasDrill = stateManager.get(STATE_HAS_DRILL);
    this.hasDash = stateManager.get(STATE_HAS_DASH);

  }

  setNormal() {
    this.mode = MODE_NORMAL;
    this.sprite.body.clearShapes();
    this.sprite.body.addRectangle(5,5,0,7);
  }

  setWheel() {
    this.mode = MODE_WHEEL;
    this.sprite.body.clearShapes();
    this.sprite.body.addRectangle(5,5,0,7);
    // this.sprite.body.loadPolygon('globalPhysicsData','alien-wheel-1');
  }

  async down() {
    if (this.isJumping && this.hasDrill) {
      this.isDrilling = true;
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 80;
      audioManager.play(AUDIO_PATH_ALIEN_DRILL_MIDDLE_FX,1,true);
      await this.playAnimation('drill-start');
      this.playAnimation('drill');
    }
  }

  async up() {
    this.isDrilling = false;
    audioManager.stop(AUDIO_PATH_ALIEN_DRILL_MIDDLE_FX,400);

    if (!this.isJumping) {
      if (this.mode === MODE_WHEEL) {
        this.jumpTime = new Date().getTime();
        this.isJumping = true;
        await this.wheelJump();
      }
    }
    else {
      if (!this.isRocketing && this.hasBoost) {
        this.isRocketing = true;
        await this.playAnimation('rocket-start');
        // this.sprite.body.thrust(1200);

        audioManager.play(AUDIO_PATH_BOOST_FX,0.4);
        this.sprite.body.velocity.y = -180;
        this.emit('rocket');
        await sleep(500);
        await this.playAnimation('rocket-end');
        this.rest();
      }
      else {
        // this.sprite.body.thrust(1200);
        // let s = new ShrinkCloudParticle(this.game,this.x() + rand(-5,5),this.y(),3*rand(-1,1),4,'rgb(255,255,255)',rand(3,6),rand(0.1,0.4));
        // s.start();
        // s.on('done', () => {
        //   s.sprite.destroy();
        // })
      }

    }
  }

  moveLeft(newHit) {
    let timeNow = new Date().getTime();
    if (newHit && this.hasDash && timeNow - this.lastLeftTime < this.dashThresholdTime) {
      this.dash(true).then( () => {
        this.rest();
      });
    }
    else {
      this.move();
    }
    if (newHit)
      this.lastLeftTime = timeNow;
    this.faceLeft();
  }

  move() {
    if (!this.isJumping && !this.isDrilling) {
      if (this.mode === MODE_NORMAL) {
        audioManager.play(AUDIO_PATH_ALIEN_GROUND_SCOOT_FX,1,true);
        this.playAnimation('walk');
      }
      else if (this.mode === MODE_WHEEL) {
        this.playAnimation('wheel');
        audioManager.play(AUDIO_PATH_WHEEL_SQUEAK_FX,0.3,true);
      }
    }
    else {
      console.log('tried to move');
    }
  }

  async dash(isLeft) {
    this.isDashing = true;
    // if (this.mode === MODE_WHEEL) {
    this.sprite.body.velocity.x = 150 * (isLeft ? -1 : 1);
    // this.sprite.body.velocity.y = 0;
    this.dashFlame.alpha = 1;
    this.dashFlame.x = this.x();
    this.dashFlame.y = this.y();
    this.dashFlame.scale.x = (isLeft ? 1 : -1);
    this.dashFlame.play('on');
    audioManager.play(AUDIO_PATH_DASH_FX,0.7);
    await this.playAnimation('dash');
    this.isDashing = false;
    this.updateVelocity(isLeft);
    // }
  }

  moveRight(newHit) {
    let timeNow = new Date().getTime();
    if (this.hasDash && newHit && timeNow - this.lastRightTime < this.dashThresholdTime) {
      this.dash(false).then( () => {
        this.rest();
      });
    }
    else {
      this.move();
    }
    if (newHit)
      this.lastRightTime = timeNow;
    this.faceRight();
  }

  updateVelocity(isLeft) {
    if (!this.isPlayingAnimation('dash'))
      this.sprite.body.velocity.x = (isLeft ? -1 : 1) * (this.mode === MODE_NORMAL ? this.walkVelocity : this.wheelVelocity);
  }

  async cry() {
    audioManager.play(AUDIO_PATH_ALIEN_CRY_FX,0.8);
    await this.playAnimation('cry');
  }
}

'use-strict';

class Ghost extends SimpleCharacter {
  constructor(game) {
    super(game);
    this.name = 'ghost';
  }

  static configName() {
    return 'ghost';
  }

  faceLeft() {
    this.sprite.scale.x = -1;
  }

  faceRight() {
    this.sprite.scale.x = 1;
  }

  startBounce() {
    if (typeof this.bounceTimer === 'undefined') {
      let delta = 3;
      let bounceTime = 1600;
      let y = this.sprite.body.y;
      let up = false;

      let move = (direction, yBase) => {
        tweenPromise(this.game, this.sprite.body, {y : yBase + (direction ? delta : -delta)}, bounceTime,0,Phaser.Easing.Sinusoidal.InOut);
      };

      let timer = this.game.time.create(false);

      timer.loop(bounceTime, () => {
        up = !up;
        move(up,y);
      });

      this.bounceTimer = timer;

    }

    this.bounceTimer.start();

    // this.bounceTimer = setInterval( () => {
    //   up = !up;
    //   move(up,y);
    // },bounceTime);
  }

  async appear() {
    audioManager.play(AUDIO_PATH_GHOST_IN_FX,0.5);
    await this.playAnimation('appear');
  }

  async disappear() {
    audioManager.play(AUDIO_PATH_GHOST_OUT_FX,0.5);
    await this.playAnimation('disappear');
  }

  async dash() {
    audioManager.play(AUDIO_PATH_GHOST_OUT_FX,0.5);
    await this.playAnimation('dash');
  }
  
  stopBounce() {
    // clearInterval(this.bounceTimer);
    this.bounceTimer.stop();
  }

  startParticles() {

    this.particleTimer = setInterval( () => {
      let varX = 1;
      let varY = 14;

      let x = this.sprite.x - 2 + Math.random() * varX - varX/2;
      let y = this.sprite.y - 2 + Math.random() * varY - varY/2;
      let vMaxX = 0.3;
      let vMaxY = 1;

      let vx = Math.random() * vMaxX * 2 - vMaxX;
      let vy = Math.random() * vMaxY * 2 - vMaxY;

      let particle = new CloudParticle(this.game,x,y,vx,vy);
      particle.on('done', () => {
        particle.sprite.destroy();
        // delete particle;
      });
      this.sprite.bringToTop();
    },200);
  }

  stopParticles() {
    clearInterval(this.particleTimer);
  }

  setup(data) {
    super.setup(data);

    // this.sprite.body.addRectangle(10,10,0,2);
    // this.sprite.body.fixedRotation = true;
    this.sprite.body.clearShapes();
    this.sprite.body.kinematic = true;
    // this.sprite.body.static = true;

  }

}

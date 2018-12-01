'use strict';

class PowerUp extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;
    this.x = x;
    this.y = y;

    // let s = game.add.sprite(x,y);
    // s.fixedToCamera = true;
    // this.sprite = s;
  }

  doBolts() {
    let bolts = this.game.add.sprite(this.x,this.y,'light-bolts');
    bolts.anchor.setTo(0.5,0.5);
    let anim = bolts.animations.add('on',linearArray(0,16),14,false).play();
    return new Promise( (resolve, reject) => {
      // bolts
      anim.onComplete.addOnce((sprite, an) => {
        bolts.destroy();
        resolve();
      }, this);
      anim.play();
    });
  }

  startParticles() {
    let maxDist = 100;
    let numParticles = 200;
    let numShakeIntervals = 4;
    let currentShakeAmount = 0;


    let timer = this.game.time.create(false);
    timer.loop(10, () => {
      let angle = rand(0, Math.PI*2);
      let x = this.x + maxDist * Math.cos(angle);
      let y = this.y + maxDist * Math.sin(angle);

      let p = this.game.add.sprite(x,y,'particle');
      tweenPromise(this.game, p, {x : this.x, y : this.y}, 1000, 0, Phaser.Easing.Linear.None).then( () => {
        p.destroy();
      });
      // await sleep(10);
      // if (Math.floor(k*numShakeIntervals/numParticles) > currentShakeAmount) {
      //   currentShakeAmount++;
      //   cameraController.shakeForever(currentShakeAmount);
      // }
    });
    timer.start();
    this.particleTimer = timer;

  }

  stopParticles() {
    cameraController.stopShaking();
    this.particleTimer.stop();

  }
}

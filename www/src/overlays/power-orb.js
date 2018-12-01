'use strict';

class PowerOrb extends EventEmitter {
  constructor(game,x,y,number) {
    super();
    this.game = game;
    this.number = number;
    let s = this.game.add.sprite(x,y,'particle-3x3');
    s.type = 'power-orb';
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();
    let c = s.body.addCircle(2,0,0);
    c.sensor = true;
    // s.body.fixedRotation = true;
    s.body.static = true;
    // s.body.kinematic = true;
    s.obj = this;
    // s.body.addC
    this.sprite = s;

    // p.scale.setTo(2,2);
    let numThings = 10;
    let varX = 10; let varY = 10;
    let particles = [];
    for(let k = 0; k < numThings; k++) {
      let p = this.game.add.sprite(x,y,'particle');
      p.tint = 0xe7e7e7;
      particles.push(p);
    }
    this.particles = particles;


    let timer = this.game.time.create(false);
    timer.loop(100, async () => {
      let px = s.body.x; let py = s.body.y;
      for(let k = 0; k < numThings; k++) {
        let p = particles[k];
        px = s.body.x; py = s.body.y;
        let toX = px + (Math.random()*varX - varX/2);
        let toY = py + (Math.random()*varY - varY/2);

        await tweenPromise(game, p, {x: toX, y : toY}, 80,0,Phaser.Easing.Linear.None);
      }
    });
    timer.start();
    this.particleTimer = timer;
  }

  startFollow(gap) {
    gap = (typeof gap === 'undefined' ? 10 : gap);
    let timer = this.game.time.create(false);
    let up = true;
    timer.loop(100, async () => {
      up = !up;
      this.update(gap,up);
    });
    timer.start();
    this.updateTimer = timer;
  }

  stopFollow() {
    this.updateTimer.stop();
    this.particleTimer.stop();
    this.particles.forEach( (p) => {
      p.destroy();
    });
  }

  update(gap,up) {
    // let gap = 10;
    let x = this.game.me.x() + (this.game.me.sprite.scale.x > 0 ? gap : -gap);
    let y = this.game.me.y();

    tweenPromise(this.game, this.sprite.body, {x: x, y: y}, 100, 0 , Phaser.Easing.Linear.None);
  }


}

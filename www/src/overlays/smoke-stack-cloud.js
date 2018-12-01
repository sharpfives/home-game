'use strict';

class SmokeStackCloud extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;
    this.x = x;
    this.y = y;

    let s = game.make.sprite(0,0);
    // s.anchor.setTo(0.5,0.5);
    // s.fixedToCamera = true;
    this.sprite = s;
  }

  start() {
    let makeParticle = (x,y) => {
      let vx = rand(-0.1,0.1);
      let vy = rand(-0.3,-0.1);
      let size = rand(4,7);
      let shrink = rand(0.02,0.04);
      let e = new ShrinkCloudParticle(this.game, x, y, vx, vy, 'rgb(155,155,155)', size, shrink);
      this.sprite.addChild(e.sprite);
      e.start();
      e.on('done', () => {
        e.sprite.destroy();
      });
    };

    let numInitParticles = 10;
    for( let i = 0; i < numInitParticles; i++) {
      let x = this.x + rand(-1,1);
      let y = this.y - i*3;
      makeParticle(x,y);
    }

    let timer = this.game.time.create(false);
    let time = 500;

    timer.loop(time, () => {
      let x = this.x + rand(-1,1);
      let y = this.y + rand(0,-2);
      makeParticle(x,y);
    });
    timer.start();

  }
}

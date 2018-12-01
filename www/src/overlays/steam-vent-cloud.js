'use strict';

class SteamVentCloud extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;
    this.x = x;
    this.y = y;

  }

  async start(delay) {

    let addParticle = (delayTime) => {
      let vx = rand(-0.2,0.2);
      let vy = rand(-10,-7);
      let size = rand(5,15);
      let shrink = rand(0.15,0.25);
      let colorVal = 231;
      let e = new ShrinkCloudParticle(this.game, this.x + 3*rand(-1,1), this.y, vx, vy, `rgb(${colorVal},${colorVal},${colorVal})`, size);
      this.game.physics.p2.enable(e.sprite, DEBUG_SPRITE_POLYGONS);
      e.sprite.body.clearShapes();
      let c = e.sprite.body.addRectangle(10,10,0,0);
      c.sensor = true;
      e.sprite.body.static = true;
      tweenPromise(this.game,e.sprite.body,{y : 0},500,delayTime,Phaser.Easing.Linear.None).then( () => {
        e.sprite.destroy();
      });

      e.sprite.body.onBeginContact.add((body1, bodyB, shapeA, shapeB, equation) => {

        if (body1 == null) {
          return;
        }

        let otherSprite = body1.sprite;
        if (typeof otherSprite === 'undefined' || otherSprite == null) {
          return;
        }

        if (otherSprite.key === 'player') {
          console.log("TOUCHED PLAYER");
          otherSprite.body.velocity.y = -100;
        }
      });

      e.sprite.type = 'steam-vent';
    };

    await sleep(delay);

    let timer = this.game.time.create(false);
    let time = 4000;

    timer.loop(time, () => {
      audioManager.play(AUDIO_PATH_STEAM_FX,0.25);
      let numParticles = 40;
      let delay = 80;
      for(let i = 0; i < numParticles; i++) {
        addParticle(rand(10,delay)*i);
      }
    });
    timer.start();

  }
}

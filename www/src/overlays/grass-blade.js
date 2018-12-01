'use strict';

class GrassBlade extends EventEmitter {
  constructor(game,x,y,type) {
    super();
    this.game = game;

    type = (typeof type === 'undefined' ? 'grass1' : type);
    let s = this.game.add.sprite(x,y,type);
    s.smoothed = false;
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();
    let r = s.body.addRectangle(s.width,s.height,s.width/2,-s.height/2);
    s.body.static = true;
    r.sensor = true;
    s.anchor.setTo(0,1);

    // s.body.fixedRotation = true;
    // s.body.static = true;
    // s.body.addC
    this.sprite = s;

    s.body.onBeginContact.add((body1, bodyB, shapeA, shapeB, equation) => {

      if (body1 == null) {
        return;
      }

      let otherSprite = body1.sprite;

      if (typeof otherSprite === 'undefined') {
        return;
      }

      if (otherSprite.key === 'player') {
        // console.log("TOUCHED PLAYER");
        // let vx = otherSprite.body.velocity.x;
        // let vy = otherSprite.body.velocity.y;
        // let v = Math.sqrt(vx*vx + vy*vy);
        // tweenPromise(this.game,s.body,{angle : 90},1000);
        let v = 0.25 + Math.random() * 0.25;
        this.wave(v);
        audioManager.play(AUDIO_PATH_GRASS_FX,0.7);
      }

    }, this);
  }

  async wave(magnitude) {
    let maxAngle = 45 * magnitude;
    let numIters = 5;

    let time = 400;
    let timeDecAmt = 0;
    let decAmt = maxAngle/numIters;
    let isEven = (Math.random() > 0.5 ? 1 : -1);
    for(let k = 0; k < numIters; k++) {
      let angle = (maxAngle - k * decAmt) * (k % 2 ? isEven : -isEven);
      await tweenPromise(this.game,this.sprite.body,{angle : angle},time - k*timeDecAmt ,0,Phaser.Easing.Sinusoidal.Out);
    }

    await tweenPromise(this.game,this.sprite.body,{angle : 0},time);

  }


}

'use strict';

class Wheel extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;

    let s = this.game.add.sprite(x,y,'wheel');
    s.type = 'wheel';
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();
    s.body.addCircle(2,0,0);
    s.body.fixedRotation = true;
    // s.body.static = true;
    s.body.mass = 100;
    this.sprite = s;
  }

  push(vx) {
    this.sprite.body.fixedRotation = false;
    this.sprite.body.mass = 1;
    this.sprite.body.velocity.x = vx;
  }
}

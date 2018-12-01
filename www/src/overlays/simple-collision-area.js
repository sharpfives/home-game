'use strict';

class SimpleCollisionArea extends EventEmitter {
  constructor(game,x,y,w,h) {
    super();
    this.game = game;

    let s = this.game.add.sprite(x,y);
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();
    let c = s.body.addRectangle(w,h,w/2,h/2);
    c.sensor = true;
    // s.body.fixedRotation = true;
    s.body.static = true;
    // s.body.kinematic = true;
    s.obj = this;
    // s.body.addC
    this.sprite = s;
  }

}

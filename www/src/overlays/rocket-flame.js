'use strict';

class RocketFlame extends EventEmitter {
  constructor(game) {
    super();
    this.game = game;

    let s = this.game.add.sprite(0,0,'rocket-flame');
    s.type = 'rocket-flame';
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();

    s.body.static = true;
    // let c = s.body.addRectangle(30,10,0,0);
    // c.sensor = true;
    s.body.immovable = true;
    // s.body.kinematic = true;
    s.animations.add('burst',[0,1,2,3,4,5,6,7,8],15,false);
    s.animations.add('off',[8],1,false).play();
    this.sprite = s;

  }

  start(x,y) {
    this.sprite.body.x = x;
    this.sprite.body.y = y;
    this.sprite.play('burst');
  }
}

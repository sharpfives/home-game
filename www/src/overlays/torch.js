'use strict';

class Torch extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;

    let s = this.game.add.sprite(x,y,'torch');
    s.type = 'torch';
    s.obj = this;
    this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
    s.body.clearShapes();
    let c = s.body.addRectangle(10,10,0,0);
    c.sensor = true;
    // s.body.immovable = true;
    s.body.static = true;
    s.body.kinematic = true;
    s.animations.add('on',linearArray(1,19),12,true);
    s.animations.add('off',[0],1,false).play();
    this.sprite = s;

    s.body.onBeginContact.add( async (body1, bodyB, shapeA, shapeB, equation) => {
      if (body1 == null) {
        return;
      }
      let otherSprite = body1.sprite;
      if (typeof otherSprite === 'undefined')
        return;
      if (otherSprite == null) {
        return;
      }
      if (otherSprite.type !== 'player' || this.didLight) {
        return;
      }

      s.play('on');
      audioManager.play(AUDIO_PATH_TORCH_FX,0.7);
      this.didLight = true;
      this.emit('lit');
    });
  }

}

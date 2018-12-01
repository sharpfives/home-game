'use strict';

class LightBolts extends EventEmitter {
  constructor(game) {
    super();
    this.game = game;

    let lightBolts = this.game.add.sprite(721,138,'light-bolts');
    lightBolts.anchor.setTo(0.5,1);
    // lightBolts.fixedToCamera = true;
    lightBolts.animations.add('on',linearArray(0,35),15,false);
    this.sprite = lightBolts;
  }

  async start() {
    let me = this.game.me;
    this.sprite.x = me.x();
    this.sprite.y = me.y();
    this.sprite.play('on');
  }
}

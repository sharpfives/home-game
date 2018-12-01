'use strict';

class OceanOverlay extends EventEmitter {
  constructor(game) {
    super();
    this.game = game;
    let s = this.game.add.sprite(0,this.game.world.height - 61,'water-left');
    s.animations.add('play');
    s.animations.play('play', 8, true);
    this.sprite = s;


    let reflection = new WaterEffectOverlay(game,60,this.game.world.height - 61,'water-reflection')
    this.reflection = reflection;
    // let reflection = this.game.add.sprite();
    // this.waterEffect(reflection,0,reflection.width);

  }

}

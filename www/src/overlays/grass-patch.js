'use strict';

class GrassPatch extends EventEmitter {
  constructor(game,x,y,width,parent) {
    super();
    this.game = game;

    // let s = this.game.add.sprite(x,y);
    // s.smoothed = false;

    let grassSpacing = 3;
    let numGrassBlades = Math.floor(width / grassSpacing);

    let numGrassTypes = 4;

    for(let k = 0; k < numGrassBlades; k++) {
      let label = 'grass' + Math.ceil(Math.random() * numGrassTypes);
      let blade = new GrassBlade(this.game,x + k*grassSpacing, y + Math.random() * 3, label);
      blade.sprite.scale.setTo(Math.random() > 0.5 ? 1 : -1,1);
      parent.addChild(blade.sprite);
    }
    // this.sprite = s;
  }
}

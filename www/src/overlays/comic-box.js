'use strict';

class ComicBox extends EventEmitter {
  constructor(game,x,y,width,height) {
    super();
    this.game = game;

    let bmd = this.game.add.bitmapData(width,height);
    let s = this.game.add.sprite(x,y,bmd);
    s.fixedToCamera = true;
    this.sprite = s;

    bmd.ctx.fillStyle = 'rgb(167,167,167)';
    bmd.ctx.strokeStyle = 'rgb(231,231,231)';
    bmd.ctx.lineWidth = 4;
    bmd.ctx.rect(0,0,width,height);
    bmd.ctx.fill();
    bmd.ctx.stroke();

  }
}

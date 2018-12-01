'use strict';

class EventTimeline extends EventEmitter {
  constructor(game,x,y,width,height) {
    super();
    this.game = game;

    let timelineInsetX = 0;
    let bmd = this.game.make.bitmapData(width, height);
    bmd.ctx.fillStyle = "rgba(255,255,255,0.5)";
    bmd.ctx.fillRect(timelineInsetX, 2, width-timelineInsetX, 1);
    let s = this.game.add.sprite(x,y,bmd);

    this.sprite = s;


  }

  removeEvents() {
    for(let c in this.sprite.children) {
      let child = this.sprite.children[c];
      if (child.part instanceof RobotPart) {
        child.destroy();
      }
    }
  }

  addEvent(part, timePercent) {
    let s = this.game.make.sprite(Math.round(timePercent * this.sprite.width),0,'particle');
    s.part = part;
    this.sprite.addChild(s);
  }
}

'use strict';

class LightBeam extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;

    let width = 20;
    let height = 50;
    this.width = width;
    this.height = height;
    let bmd = this.game.add.bitmapData(width,height);
    bmd.smoothed = false;
    let s = this.game.add.sprite(x,y,bmd);
    s.smoothed = false;
    // s.fixedToCamera = true;
    this.sprite = s;

    bmd.ctx.fillStyle = 'rgb(231,231,231)';
    bmd.ctx.strokeStyle = 'rgb(231,231,231)';
    bmd.ctx.lineWidth = 4;
    // bmd.ctx.rect(0,0,width,height);
    // bmd.ctx.fill();
    // bmd.ctx.stroke();
    this.bmd = bmd;

    this.start();
  }

  async start() {
    let updateInterval = 100;
    let bmd = this.bmd;
    let width = this.width/2;
    let height = this.height;

    let descend = async () => {
      let numSteps = 10;
      for(let k = 0; k < numSteps; k++) {
        bmd.ctx.clearRect(0,0,this.width, this.height);
        bmd.ctx.rect(0,0,width*k/numSteps,height);
        bmd.ctx.fill();
        bmd.dirty = true;
        bmd.update();
        bmd.render();
        await sleep(updateInterval);

      }

      numSteps = 200;
      for(let k = 0; k < numSteps; k++) {
        bmd.ctx.clearRect(0,0,this.width, this.height);
        bmd.ctx.rect(0,0,width + 5*Math.sin(2*Math.PI*0.1*k),height);
        bmd.ctx.fill();
        bmd.dirty = true;
        bmd.update();
        bmd.render();
        await sleep(updateInterval);

      }
    };

    await descend();
  }
}

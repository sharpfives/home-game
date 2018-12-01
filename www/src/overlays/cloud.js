'use strict';

class Cloud extends EventEmitter {
  constructor(game,x,y,color) {
    super();
    color = (typeof color === 'undefined' ? 'rgb(75,75,75)' : color);

    let maxWidth = 60;
    let minWidth = 20;
    let minHeight = 10;
    let maxHeight = 30;
    let width = minWidth + (maxWidth - minWidth)*Math.random();
    let height = minHeight + (maxHeight - minHeight)*Math.random();
    let bmd = game.add.bitmapData(width, height);
    bmd.smoothed = false;

    let s = game.add.sprite(x,y,bmd);
    s.smoothed = false;
    this.sprite = s;
    s.bringToTop();
    bmd.ctx.fillStyle = color;
    bmd.ctx.lineWidth = 1;

    // let ctx = bmd.canvas.getContext('2d');
    // ctx.mozImageSmoothingEnabled = false;
    // ctx.imageSmoothingQuality = "low";
    // ctx.webkitImageSmoothingEnabled = false;
    // ctx.msImageSmoothingEnabled = false;
    // ctx.imageSmoothingEnabled = false;
    // bmd.ctx.fillRect(0,0,width,height);
    // bmd.dirty = true;
    // bmd.render();

    bmd.ctx.clearRect(0,0,width,height);

    let rMax = 8;
    for(let i = 0; i < 5; i++) {
      let x = rMax + Math.random() * (width - rMax*2);
      let r = (Math.random()*5 + 3)*(1 - Math.abs(x - width/2)/(width/2));

      let y = height;// - Math.random()*5;
      bmd.ctx.arc(x,y,r,0,2*Math.PI);
      bmd.ctx.fill();
    }


    bmd.dirty = true;
    bmd.render();
    bmd.update();

  }
}

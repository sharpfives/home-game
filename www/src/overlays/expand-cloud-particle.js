'use strict';

class ExpandCloudParticle extends EventEmitter {
  constructor(game,x,y,vx,vy,color) {
    super();
    color = (typeof color === 'undefined' ? 'rgb(255,255,255)' : color);
    let size = 72;
    let width = size; let height = size;
    let bmd = game.add.bitmapData(width, height);
    let s = game.add.sprite(x,y,bmd);
    s.smoothed = false;
    s.anchor.setTo(0.5,0.5);
    this.sprite = s;
    s.bringToTop();
    bmd.ctx.fillStyle = color;
    bmd.ctx.lineWidth = 1;

    bmd.ctx.imageSmoothingEnabled = false;
    bmd.ctx.msImageSmoothingEnabled = false;
    // bmd.ctx.fillRect(0,0,width,height);
    // bmd.dirty = true;
    // bmd.render();

    let r = width/2; let h = height;
    let numPts = 20;
    let radii = [];
    for (let k = 0; k < numPts; k++) {
      radii[k] = 2;
    }

    let iter = 1;

    let timer = setInterval( () => {

      s.x += vx;
      s.y += vy;

      bmd.ctx.clearRect(0,0,width,height);
      bmd.ctx.beginPath();
      let rsum = 0;
      for (let k = 0; k < numPts; k++) {
        let shrinkBy = 2 + Math.random()*2;
        if (k > 1) {
          radii[k] += shrinkBy;
          radii[k] = (radii[k] + radii[k-1] + radii[k-2])/3;
        }
        else if (k > 0) {
          radii[k] += shrinkBy;
          radii[k] = (radii[k] + radii[k-1])/2;
        }
        else {
          radii[k] += shrinkBy;
        }
        radii[k] = Math.max(radii[k],0);

        let angle = k * Math.PI * 2 / numPts;
        let x = width/2 + radii[k] * Math.cos(angle);
        let y = width/2 + radii[k] * Math.sin(angle);

        bmd.ctx.lineTo(Math.round(x),Math.round(y));

        rsum += radii[k];
      }
      bmd.ctx.fill();

      bmd.dirty = true;
      bmd.render();

      iter++;
      if (rsum/numPts >= size/2) {
        clearInterval(timer);
        this.emit('done');
        return;
      }
    },100);
  }
}

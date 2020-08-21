'use strict';

class ShrinkCloudParticle extends EventEmitter {
  constructor(game,x,y,vx,vy,color,size,shrinkBy) {
		super();
		this.game = game;
    this.shrinkBy = 2 * (typeof shrinkBy === 'undefined' ? Math.random()*2 : shrinkBy);
    color = (typeof color === 'undefined' ? 'rgb(255,255,255)' : color);
    size = (typeof size === 'undefined' ? 72 : size);

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
    this.width = width;
    this.height = height;
    this.bmd = bmd;
    this.vx = vx;
    this.vy = vy;

    this.bmd.ctx.arc(width/2,height/2,width/2,0,2*Math.PI);
    this.bmd.ctx.fill();
  }

  async start() {

		const time = rand(3000,4000);
		const distX = this.vx * 50;
		await Promise.all([
			tweenPromise(this.game, this.sprite.scale, {x : 0, y : 0}, time, 0, Phaser.Easing.Linear.None),
			tweenPromise(this.game, this.sprite, {x : this.sprite.x + distX}, time,0,Phaser.Easing.Linear.None)
		]);

		this.emit('done');
    // let r = this.width/2; let h = this.height;
    // let numPts = 20;
    // let radii = [];
    // for (let k = 0; k < numPts; k++) {
    //   radii[k] = r;
    // }

    // let iter = 1;

    // let timer = setInterval( () => {

    //   this.sprite.x += this.vx;
    //   this.sprite.y += this.vy;

    //   this.bmd.ctx.clearRect(0,0,this.width,this.height);
    //   this.bmd.ctx.beginPath();
    //   let rsum = 0;
    //   for (let k = 0; k < numPts; k++) {
    //     let shrinkBy = this.shrinkBy;
    //     if (k > 1) {
    //       radii[k] -= shrinkBy;
    //       radii[k] = (radii[k] + radii[k-1] + radii[k-2])/3;
    //     }
    //     else if (k > 0) {
    //       radii[k] -= shrinkBy;
    //       radii[k] = (radii[k] + radii[k-1])/2;
    //     }
    //     else {
    //       radii[k] -= shrinkBy;
    //     }
    //     radii[k] = Math.max(radii[k],0);

    //     let angle = k * Math.PI * 2 / numPts;
    //     let x = r + radii[k] * Math.cos(angle);
    //     let y = r + radii[k] * Math.sin(angle);

    //     this.bmd.ctx.lineTo(Math.round(x),Math.round(y));

    //     rsum += radii[k];
    //   }
    //   this.bmd.ctx.fill();

    //   this.bmd.dirty = true;
    //   this.bmd.render();

    //   iter++;
    //   if (rsum/numPts >= r) {
    //     clearInterval(timer);
    //     this.emit('done');
    //     return;
    //   }
    // },100);

  }
}

'use strict';

class CloudTransition extends EventEmitter {
  constructor(game) {
    super();
    this.game = game;
    let s = game.add.sprite(0,0);
    s.fixedToCamera = true;
    this.sprite = s;
  }

  async fadeOut(direction) {

    let inset = 20;
    let vMag = 1.5;

    // right
    let startX = -inset;
    let endX = this.game.width + inset;
    let vx = vMag;
    let vy = 0;

    if (direction === 'left') {
      startX = this.game.width + inset;
      endX = -inset;
      vx = -vMag;
    }
    else if (direction === 'up') {
      startX = this.game.height + inset;
      endX = -inset;
      vx = 0;
      vy = -vMag;
    }
    else if (direction === 'down') {
      startX = -inset;
      endX = this.game.height + inset;
      vx = 0;
      vy = vMag;
    }

    // let startY = this.game.height;
    let numXlevels = 25;

    let addParticle = (x,y,time) => {
      return new Promise( (resolve, reject) => {
        let e = new ShrinkCloudParticle(this.game, x, y, vx, vy, 'rgb(231,231,231)',undefined,rand(0.5,2));
        this.sprite.addChild(e.sprite);
        setTimeout( () => {
          e.start();
        }, time);
        e.on('done',() => {
          e.sprite.destroy();
          return resolve();
        });
      });
    };

    let promises = [];

    let numYlevels = 3;
    let xVar = 10;

    for(let k = 0; k < numXlevels; k++) {

      let numYlevels = 3;
      for (let n = 0; n < numYlevels; n++) {
        let x = 0; let y = 0;
        if (direction === 'left' || direction === 'right') {
          x = (Math.random() * xVar - xVar/2) + startX + k * (endX - startX) / numXlevels;
          y = Math.random() * this.game.height;
        }
        else {
          y = (Math.random() * xVar - xVar/2) + startX + k * (endX - startX) / numXlevels;
          x = rand(-inset,this.game.width+inset);
        }
        let time = (x/this.game.width)*40 + n*(Math.random() *20);
        promises.push(addParticle(x,y, time));
      }

      if (k === 1) {
        this.emit('start');
      }
    }

    await Promise.all(promises);
    // console.log('DONE ALL');
  }

  async fadeIn(direction) {

    let inset = 20;

    // right
    let startX = -inset;
    let endX = this.game.width + inset;
    let vx = 1;
    let vy = 0;

    if (direction === 'left') {
      startX = this.game.width + inset;
      endX = -inset;
      vx = -1;
    }
    else if (direction === 'up') {
      startX = this.game.height + inset;
      endX = -inset;
      vx = 0;
      vy = -1;
    }
    else if (direction === 'down') {
      startX = -inset;
      endX = this.game.height + inset;
      vx = 0;
      vy = 1;
    }

    // let startY = this.game.height;
    let numXlevels = 25;

    let addParticle = (x,y) => {
      return new Promise( (resolve, reject) => {
        let e = new ExpandCloudParticle(this.game, x, y, vx, vy,'rgb(231,231,231)');
        this.sprite.addChild(e.sprite);
        e.on('done',() => {
          return resolve();
        });
      });
    };

    let promises = [];

    let numYlevels = 3;
    let xVar = 10;

    for(let k = 0; k < numXlevels; k++) {

      let numYlevels = 3;
      for (let n = 0; n < numYlevels; n++) {
        let x = 0; let y = 0;
        if (direction === 'left' || direction === 'right') {
          x = (Math.random() * xVar - xVar/2) + startX + k * (endX - startX) / numXlevels;
          y = Math.random() * this.game.height;
        }
        else {
          y = (Math.random() * xVar - xVar/2) + startX + k * (endX - startX) / numXlevels;
          x = rand(-inset,this.game.width+inset);
        }

        promises.push(addParticle(x,y));
        await sleep(Math.random() * 20);
      }

      await sleep(40);
    }

    await Promise.all(promises);
    // console.log('DONE ALL');
  }

  clearParticles() {
    this.sprite.removeChildren();
  }
}

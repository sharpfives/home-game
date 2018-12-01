'use strict';

class MushroomCloud extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;
    let s = game.add.sprite(x,y);
    s.anchor.setTo(0.5,0.5);
    // s.fixedToCamera = true;
    this.sprite = s;
  }

  async start() {

    let particles = [];
    let numParticlesInTop = 30;
    let xVarTop = 80;
    let yVarTop = 20;

    for(let k = 0; k < numParticlesInTop; k++) {
      let x = Math.random()*xVarTop - xVarTop/2 + 64//Math.exp((Math.random() - 0.5)/xVarTop);
      let y = 50 - Math.random() * yVarTop;
      let vx = -0.1*(x - 64)/32;
      let vy = -0.2*32/(Math.abs(x - 64 + 0.5));
      particles.push({
        loc : [x,y],
        vel : [vx,vy],
        shrink : 0.1*Math.abs(x - 64)/32,
        size : 40
      });
    }

    let xVarMid = 15;
    let yVarMid = 60;
    let numParticlesInMiddle = 30;
    for(let k = 0; k < numParticlesInMiddle; k++) {
      let x = 64 + Math.random() * xVarMid - xVarMid/2;
      let y = 64 + Math.random() * yVarMid - yVarMid/2;
      let vx = -0.1*(x - 64)/32;
      let vy = -0.2;
      particles.push({
        loc : [x,y],
        vel : [vx,vy],
        shrink : 0.1 + 0.1*Math.abs(x - 64)/32,
        size : 20
      });
    }

    let xVarBot = 40;
    let yVarBot = 10;
    let numParticlesInBottom = 50;
    for(let k = 0; k < numParticlesInBottom; k++) {
      let x = 64 + (Math.random() > 0.5 ? 1 : -1)* (20 +  Math.random() * xVarBot - xVarBot/2);
      let y = 100 + Math.random() * yVarBot - yVarBot/2;
      let vx = 0.8*(x - 64)/32;
      let vy = 0;
      particles.push({
        loc : [x,y],
        vel : [vx,vy],
        shrink : 0.06 + 0.1*Math.abs(x - 64)/32,
        size : 20
      });
    }

    let numRingParticles = 30;
    let rx = 30;
    let ry = 7;
    let xVarRing = 4;
    let yVarRing = 2;
    for(let k = 0; k < numRingParticles; k++) {
      let x = (Math.random()*xVarRing - xVarRing/2) + 64 + rx * Math.cos(2 * Math.PI *  k / numRingParticles) ;
      let y = (Math.random()*yVarRing - yVarRing/2) + 64 + ry * Math.sin(2 * Math.PI * k / numRingParticles);
      let vx = 0.2*(x - 64)/32;
      let vy = 0;
      particles.push({
        loc : [x,y],
        vel : [vx,vy],
        shrink : 0.02*Math.random() + 0.04,
        size : 10
      });
    }

    let addParticle = (x,y,vx,vy,shrink,size) => {
      return new Promise( (resolve, reject) => {
        let e = new ShrinkCloudParticle(this.game, x, y, vx, vy, 'rgb(75,75,75)', size, shrink);
        this.sprite.addChild(e.sprite);
        e.start();
        e.on('done',() => {
          e.sprite.destroy();
          return resolve();
        });
      });
    };

    let promises = [];
    for(let k in particles) {
      let p = particles[k];
      promises.push(addParticle(p.loc[0],p.loc[1],p.vel[0],p.vel[1],p.shrink,p.size));
    }

    await Promise.all(promises);
  }
}

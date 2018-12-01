'use strict';

class WideScreenOverlay extends EventEmitter {
  constructor(game) {
    super();
    this.game = game;
    let barSize = 15;

    let bmd = this.game.make.bitmapData(this.game.width, this.game.height);
    // bmd.addToWorld();
    let s = this.game.add.sprite(0,0,bmd);
    s.fixedToCamera = true;
    s.setScaleMinMax(1, 1);

    // s.z = 5000;
    this.sprite = s;

    let colorVal = 101;
    let bmdTop = this.game.make.bitmapData(this.game.width, barSize);
    bmdTop.ctx.fillStyle = `rgba(${colorVal}, ${colorVal}, ${colorVal}, 1)`;
    bmdTop.ctx.fillRect(0, 0, this.game.width, barSize);
    let topBarSprite = this.game.make.sprite(0,-barSize,bmdTop);
    s.addChild(topBarSprite);

    let bmdBottom = this.game.make.bitmapData(this.game.width, barSize);
    bmdBottom.ctx.fillStyle = `rgba(${colorVal}, ${colorVal}, ${colorVal}, 1)`;
    bmdBottom.ctx.fillRect(0, 0, this.game.width, barSize);
    let bottomBarSprite = this.game.make.sprite(0,this.game.height,bmdBottom);
    s.addChild(bottomBarSprite);

    this.topBar = topBarSprite;
    this.bottomBar = bottomBarSprite;
    this.barHeight = barSize;

    // this.hide(1);
  }

  async show(time) {
    if (typeof time === 'undefined')
      time = 1000;
    this.topBar.y = -this.barHeight;
    this.bottomBar.y = this.game.height;
    let a = tweenPromise(this.game, this.topBar, {y : 0}, time, 0, Phaser.Easing.Sinusoidal.Out);
    let b = tweenPromise(this.game, this.bottomBar, {y : this.game.height - this.barHeight}, time, 0, Phaser.Easing.Sinusoidal.Out);
    await Promise.all([a, b]);
  }

  async hide(time) {
    if (typeof time === 'undefined')
      time = 1000;
    this.topBar.y = 0;
    this.bottomBar.y = this.game.height - this.barHeight;
    let a = tweenPromise(this.game, this.topBar, {y : -this.barHeight}, time);
    let b = tweenPromise(this.game, this.bottomBar, {y : this.game.height}, time);
    await Promise.all([a, b]);
  }

}

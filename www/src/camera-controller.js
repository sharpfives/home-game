'use strict';

class CameraController extends EventEmitter {
  constructor() {
    super();
    this.isZoomFocused = false;
    this.isShaking = false;
    this.cameraPositionFilterLength = 80;
    this.cameraPositionBufferX = [];
    this.cameraPositionBufferXPosition = 0;
    this.cameraPositionBufferY = [];
    this.cameraPositionBufferYPosition = 0;

    this.cameraOffsetX = 0;
    this.cameraOffsetY = 0;
    this.shakeAmount = 2;


  }

  follow(item) {
    this.resetBuffer();
    this.currentItem = item;
  }

  unfollow(item) {
    this.currentItem = undefined;
  }

  focusAndZoom(item, zoomTime) {
    if (typeof zoomTime === 'undefined') {
      zoomTime = 1000;
    }
    let x = item.sprite.x;
    let y = item.sprite.y;

    if (item.sprite.body !== null) {
      x = item.sprite.body.x;
      y = item.sprite.body.y;
    }
    this.focusAndZoomLocation(item.game, x,y,zoomTime);
  }

  focusAndZoomLocation(game, x, y, zoomTime) {
    if (typeof zoomTime === 'undefined') {
      zoomTime = 1000;
    }
    return new Promise( (resolve, reject) => {
      this.isZoomFocused = true;

      this.resetBuffer();

      let zoomAmount = 2;
      // let camX = x;
      // let camY = y;
      let camX = x * zoomAmount;// - game.width/2 ;
      let camY = y * zoomAmount;// - game.height/2 ;
      let tween1 = tweenPromise(game, game.camera.scale, {x: zoomAmount, y: zoomAmount},zoomTime,0,Phaser.Easing.Sinusoidal.Out); //game.add.tween(game.camera.scale).to( { x : zoomAmount, y : zoomAmount}, zoomTime, Phaser.Easing.Sinusoidal.Out, true);
      let tween2 = tweenPromise(game, game.camera.view, {centerX:camX, centerY:camY},zoomTime,0,Phaser.Easing.Sinusoidal.Out); // game.add.tween(game.camera.view).to( { centerX : camX, centerY : camY}, zoomTime, Phaser.Easing.Sinusoidal.Out, true);
      // tween2.onComplete.add( () => {
      //   cb();
      // }, this);

      this.focusZoomTweens = [tween1, tween2];

      // let promise1 = tweenToPromise(tween1);
      Promise.all([tween1, tween2]).then( () => {
        // this.isZoomFocused = false;
        resolve();
      });
    });
  }

  cancelFocusZoom() {
    console.log('cancelling focus zoom');
    if (typeof this.focusZoomTweens !== 'undefined') {
      for (let t in this.focusZoomTweens){
        this.focusZoomTweens[t].stop(true);
      }
    }
  }

  resetBuffer() {
    this.cameraPositionBufferX = [];
    this.cameraPositionBufferY = [];
  }

  async shake(time,amount) {
    this.shakeAmount = (typeof amount === 'undefined' ? this.shakeAmount : amount);
    this.isShaking = true;
    await sleep(time);
    this.isShaking = false;
  }

  shakeForever(amt) {
    this.shakeAmount = (typeof amount === 'undefined' ? this.shakeAmount : amount);
    this.isShaking = true;
  }

  stopShaking() {
    this.isShaking = false;
  }

  async resetToPlayer(zoomTime) {
    if (typeof zoomTime === 'undefined') {
      zoomTime = 1000;
    }
    this.isZoomFocused = true;
    let p1 = tweenPromise(this.game, this.game.camera.view, {centerX : this.game.me.sprite.body.x + this.cameraOffsetX, centerY : this.game.me.sprite.body.y + this.cameraOffsetY}, zoomTime);
    let p2 = tweenPromise(this.game, this.game.camera.scale, {x : 1, y : 1}, zoomTime);
    await Promise.all([p1,p2]);
    this.isZoomFocused = false;
  }

  update() {

    if (this.isZoomFocused)
      return;

    let shakeAmount = this.shakeAmount;
    let shakeOffsetX = Math.random() > 0.5 ? -Math.random()*shakeAmount : Math.random()*shakeAmount;
    let shakeOffsetY = Math.random() > 0.5 ? -Math.random()*shakeAmount : Math.random()*shakeAmount;

    if (!this.isShaking) {
      shakeOffsetY = 0; shakeOffsetX = 0;
    }

    if (typeof this.currentItem !== 'undefined') {
      this.game.camera.view.centerX = shakeOffsetX + this.currentItem.sprite.body.x * this.game.camera.scale.x;
      this.game.camera.view.centerY = shakeOffsetY + this.currentItem.sprite.body.y * this.game.camera.scale.y;
      return;
    }

    let newX = this.game.me.x() + this.cameraOffsetX;
    let newY = this.game.me.y() + this.cameraOffsetY;

    if (this.cameraPositionBufferX.length < this.cameraPositionFilterLength) {
      this.cameraPositionBufferX.push(newX);
    }
    else {
      this.cameraPositionBufferX[this.cameraPositionBufferXPosition] = newX;
      this.cameraPositionBufferXPosition = ((this.cameraPositionBufferXPosition + 1)  % this.cameraPositionFilterLength);
    }

    if (this.cameraPositionBufferY.length < this.cameraPositionFilterLength) {
      this.cameraPositionBufferY.push(newY);
    }
    else {
      this.cameraPositionBufferY[this.cameraPositionBufferYPosition] = newY;
      this.cameraPositionBufferYPosition = ((this.cameraPositionBufferYPosition + 1)  % this.cameraPositionFilterLength);
    }




    this.game.camera.roundPx = false;

    this.game.camera.view.centerX = shakeOffsetX + Math.floor(mean(this.cameraPositionBufferX));
    this.game.camera.view.centerY = shakeOffsetY + Math.floor(mean(this.cameraPositionBufferY));

    // console.log(`camera x = ${newX}, y = ${newY}`);
    // this.game.camera.view.centerX = shakeOffsetX + newX;
    // this.game.camera.view.centerY = shakeOffsetY + newY;
  }

};

const cameraController = new CameraController();

'use strict';

class Character extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;
    this.name = 'un-named';

    this.collisionBeginHandlers = {};
    this.collisionEndHandlers = {};

  }

  setup(data) {
    for(let k in data) {
      this[k] = data[k];
    }
  }

  x() {
    return (this.sprite.body != null ? this.sprite.body.x : this.sprite.x);
  }

  y() {
    return (this.sprite.body != null ? this.sprite.body.y : this.sprite.y);
  }

  faceLeft() {
    this.sprite.scale.x = 1;
  }

  faceRight() {
    this.sprite.scale.x = -1;
  }

  static getLayerName(layer) {
    return this.configName() + '_' + layer;
  }

  hitBreakableBrick(brickSprite) {

  }

  update() {

  }

  async playAnimation(name, restart) {
    restart = (typeof restart === 'undefined' ? false : restart);

    let animation = this.sprite.animations.getAnimation(name);
    if (animation == null) {
      console.log(`no animation named ${name}`);
      return;
    }

    if (animation.isPlaying && this.sprite.animations.currentAnim.name === name) {
      if (restart) {
        animation.stop(false,true);
      }
      else {
        return;
      }
    }

    await new Promise( (resolve, reject) => {
      if (animation == null) {
        return resolve();
      }
      animation.onComplete.addOnce((sprite, anim) => {
        resolve();
      }, this);
      animation.play();
    });
  }

  shake(mag) {
    let initX = this.sprite.cameraOffset.x;
    let initY = this.sprite.cameraOffset.y;

    setInterval( () => {
      this.sprite.cameraOffset.x = initX + rand(-mag,mag);
      this.sprite.cameraOffset.y = initY + rand(-mag,mag);
    },50);
  }
}

'use strict';

class GroundSlime extends LayeredCharacter {
  constructor(game,x,y) {
    super(game);
    this.xCoord = x;
    this.yCoord = y;
    // this.setup();
  }

  static configName() {
    return 'ground-slime';
  }

  setup(data) {
    super.setup(data);

    this.sprite.body.x = this.xCoord;
    this.sprite.body.y = this.yCoord;
    this.sprite.obj = this;

    let rect = this.sprite.body.addRectangle(this.sprite.width-12,3,0,5);
    rect.sensor = true;

    this.playAnimation('rest');

    let timer = this.game.time.create(false);
    timer.loop(3000, () => {
      this.blink();
    });
    timer.start();
  }

  async blink() {
    if (this.isLayerPlayingAnimation('body','snap'))
      return;

    this.playAnimation('blink');
    await sleep(250);
    this.playAnimation('rest');

  }

  async snap() {
    setTimeout( () => {
      cameraController.shake(400);
    },600);
    audioManager.play(AUDIO_PATH_SLIME_EAT_FX,0.1);
    await this.playAnimation('snap');
    this.playAnimation('rest');
  }

  update() {
    let me = this.game.me;
    if (me.x() > this.x()) {
      this.faceRight();
    }
    else {
      this.faceLeft();
    }
  }
}

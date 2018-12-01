'use strict';

class PitClaw extends LayeredCharacter {
  constructor(game) {
    super(game);

    // this.setup();
  }

  static configName() {
    return 'pit-claw';
  }

  setup(data) {
    super.setup(data);

    this.sprite.body.x = 930;
    this.sprite.body.y = 170;

    this.playAnimation('rest');

  }

  async snap() {
    this.sprite.body.x = 930;
    this.sprite.body.y = 170;
    audioManager.play(AUDIO_PATH_PIT_CLAW_FX);
    setTimeout( () => {
      cameraController.shake(400);
    },600);
    await this.playAnimation('snap');
    await tweenPromise(this.game, this.sprite.body, {y : this.sprite.body.y + 100}, 2000, 0, Phaser.Easing.Linear.None);
    this.playAnimation('rest');
  }
}

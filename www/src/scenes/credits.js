'use strict';

class CreditsScene extends SceneBase {
  constructor() {
    super();
  }

  preload() {
    super.preload();
    this.game.load.bitmapFont('bit-font', 'resources/fonts/super-low-font-tight.png', 'resources/fonts/super-low-font-tight.xml');
    this.game.load.bitmapFont('bit-font-large', 'resources/fonts/font-tight.png', 'resources/fonts/font-tight.xml');
    this.game.load.spritesheet('logo','resources/images/scenes/title-screen-logo.png',55,16,8);

  }

  async create() {
    super.create();

    let me = this.game.me;
    this.game.world.setBounds(0,0,this.game.width,this.game.height);
    me.sprite.alpha = 0;

    this.inputEnabled = false;
    // me.sprite.destroy();

    let logo = this.game.add.sprite(this.game.width/2, this.game.height/2 - 10,'logo');
    logo.anchor.setTo(0.5,0.5);
    let anim = logo.animations.add('moon',[0,1,2,3,4,5,6,7],10,false);
    // logo.anchor.setTo(0.5,0.5);
    logo.fixedToCamera = true;


    let text = 'THE END';
    let textBox = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 10, 'bit-font-large', "this is some text", 5);
    textBox.anchor.setTo(0.5,0.5);
    textBox.tint = 0xe7e7e7;
    textBox.align = 'center';
    textBox.text = text;
    textBox.fixedToCamera = true;
{
    let text = '#GitHubGameOff 2018';
    let textBox = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 30, 'bit-font-large', "this is some text", 5);
    textBox.anchor.setTo(0.5,0.5);
    textBox.tint = 0xe7e7e7;
    textBox.align = 'center';
    textBox.text = text;
    textBox.fixedToCamera = true;
    }
    await sleep(2500);
    anim.play();

    audioManager.stop(AUDIO_PATH_RUMBLE_FX);
  }

  async fadeOut(e) {

  }

  update() {
    super.update();

  }
}

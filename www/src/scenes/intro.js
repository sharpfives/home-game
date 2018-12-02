'use strict';

class IntroScene extends SceneBase {
  constructor() {
    super();
  }

  preload() {
    super.preload();
    this.game.load.spritesheet('logo','resources/images/scenes/title-screen-logo.png',55,16,8);
    this.game.load.spritesheet('comet-small','resources/images/scenes/comet-small.png',64,64,5);
    this.game.load.spritesheet('comet-medium','resources/images/scenes/comet-medium.png',64,64,5);
    this.game.load.spritesheet('comet-large','resources/images/scenes/comet-large.png',64,64,4);

    this.game.load.bitmapFont('bit-font', 'resources/fonts/super-low-font-tight.png', 'resources/fonts/super-low-font-tight.xml');
    this.game.load.bitmapFont('bit-font-large', 'resources/fonts/font-tight.png', 'resources/fonts/font-tight.xml');

    this.game.load.spritesheet('particle-fall','resources/images/particle-fall.png',20,40,8);

    Player.loadResources(this.game);
    Ghost.loadResources(this.game);
    PitClaw.loadResources(this.game);
    AlienComic.loadResources(this.game);
    RocketGround.loadResources(this.game);
    GhostComic.loadResources(this.game);

    let loadingImage = this.add.sprite(0,0, 'loading-screen');

    this.load.setPreloadSprite(loadingImage);
    this.loadingImage = loadingImage;
    // this.game.load.image('clouds','resources/images/scenes/first-scene/clouds_1.png');
  }

  create() {

    super.create();

    this.loadingImage.destroy();

    this.wideScreen.show();

    this.game.stage.disableVisibilityChange = true;

    this.inputEnabled = false;
    let height = 6000;

    // let prevClouds = this.spriteWithKey('clouds');
    // prevClouds.destroy();

    let clouds = this.game.make.tileSprite(0,220,this.game.width,height,'clouds');
    this.spriteContainer.addChild(clouds);

    this.clouds = clouds;

    // let rock = this.game.add.sprite(63,64,'particle');
    // rock.tint = 0xe7e7e7;
    // this.game.physics.p2.enable(rock, false);
    // this.game.physics.p2.gravity.y = 0;
    // this.rock = rock;

    // let rock = this.game.add.sprite(63,64,'particle');
    let rock = this.game.add.sprite(63,47,'particle-fall');
    rock.animations.add('on',linearArray(1,7),15,true);
    rock.animations.add('off',[0],1,false).play();

    // rock.tint = 0xe7e7e7;
    this.game.physics.p2.enable(rock, false);
    this.game.physics.p2.gravity.y = 0;
    this.spriteContainer.addChild(rock);
    this.rock = rock;

    let groundBarHeight = 20;
    let groundBmd = this.game.make.bitmapData(this.game.width,groundBarHeight);
    let ground = this.game.add.sprite(0,height - groundBarHeight,groundBmd);
    groundBmd.ctx.fillStyle = 'rgb(52,52,52)';
    groundBmd.ctx.fillRect(0,0,this.game.width,groundBarHeight);
    this.spriteContainer.addChild(ground);

    cameraController.isZoomFocused = true;

    this.game.world.setBounds(0,0,this.game.width,height);


    let addComicBox = (name,x,y,width,height,frames) => {
      let box = new ComicBox(this.game,x,y,width,height);
      let comet = this.game.add.sprite(width/2,height/2,name);
      comet.anchor.setTo(0.5,0.3);
      comet.animations.add('adsf',frames,12,true).play();
      box.sprite.addChild(comet);
      this.spriteContainer.addChild(box.sprite);
    };


    let start = async () => {

      this.sortLayers();
      audioManager.play(AUDIO_PATH_INTRO,1,false);
      this.game.camera.view.x = 0;
      this.game.camera.view.y = 100;
      await tweenPromise(this.game, this.game.camera.view, {y : 0}, 6000, 0, Phaser.Easing.Sinusoidal.InOut);
      await sleep(1000);
      this.game.physics.p2.gravity.y = 20;
      setTimeout( () => {
        this.rock.play('on');
      },3000)
      this.game.camera.follow(rock);
      await sleep(3000);

      let logo = this.game.add.sprite(this.game.width/2 + 5, this.game.height/2 + 5,'logo');
      // logo.anchor.setTo(0,0.5);
      let anim = logo.animations.add('moon',[0,1,2,3,4,5,6,7],10,false);
      // logo.anchor.setTo(0.5,0.5);
      logo.fixedToCamera = true;
      await sleep(2500);
      anim.play();

      await sleep(5500);

      logo.destroy();

      await sleep(3000);

      // let text = 'a short game\nby @sharpfives';
      {
        let text = 'A SHORT GAME\nBY @SHARPFIVES';
        let textBox = this.game.add.bitmapText(this.game.width/2, this.game.height/2, 'bit-font-large', "this is some text", 5);
        textBox.tint = 0xe7e7e7;
        textBox.align = 'center';
        textBox.text = text;
        textBox.fixedToCamera = true;

        await sleep(5500);

        textBox.destroy();
      }

      await sleep(3500);

      {
        let text = '  FOR ETHAN';
        let textBox = this.game.add.bitmapText(this.game.width/2, this.game.height/2, 'bit-font-large', "this is some text", 5);
        textBox.tint = 0xe7e7e7;
        textBox.align = 'center';
        textBox.text = text;
        textBox.fixedToCamera = true;

        await sleep(5500);

        textBox.destroy();
      }


      await sleep(5000);

      addComicBox('comet-small',15,7,60,60,[0,1,2,3,4]);
      await sleep(1000);
      addComicBox('comet-medium',70,26,70,50,[0,1,2,3,4]);
      await sleep(1000);
      addComicBox('comet-large',35,46,70,70,[0,1,2,3]);
    };

    start();
  }

  async fadeIn(exitName) {
    this.game.stage.backgroundColor = '#a7a7a7';
  }

  update() {
    super.update();

    if (this.rock.body.y >= this.game.world.height) {
      if (!this.isFadingOut) {
        this.isFadingOut = true;
        // let t = new CloudTransition(this.game);
        // this.spriteContainer.addChild(t.sprite);
        // t.fadeIn().then( () => {
        this.game.sceneMap.exit('Intro', 'end');
        // });
      }
    }
  }
}

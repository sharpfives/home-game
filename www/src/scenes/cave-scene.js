'use strict';

class CaveScene extends SceneBase {
  constructor() {
    super();
  }

  preload() {
    super.preload();
    this.game.load.spritesheet('torch','resources/images/torch.png',25,25,19);
    this.game.load.spritesheet('cave-door','resources/images/cave-door.png',40,48,13);
    this.game.load.image('cave-door-back','resources/images/cave-door-back.png');

    this.game.load.spritesheet('painting-rockets','resources/images/painting-rockets.png',55,65,11);
    this.game.load.spritesheet('painting-moon','resources/images/painting-moon.png',45,55,11);
    this.game.load.spritesheet('painting-comet','resources/images/painting-comet.png',75,50,11);
    this.game.load.spritesheet('painting-drills','resources/images/painting-drills.png',70,50,11);

    if (DEBUG_SCENE) {
      stateManager.set(STATE_DONE_CAVE_TORCHES,true);
    }
  }

  create() {
    super.create();

    this.game.stage.backgroundColor = '#656565';

    let me = this.game.me;
    me.sprite.z = 6;
    me.setWheel();

    let numTorchesLit = 0;
    const torchLocations = [[58,170],[347,162],[50,360],[345,355]];
    const paintingNames = ['painting-moon','painting-rockets','painting-comet','painting-drills'];
    const paintingLocations = [[92,161],[300,158],[105,360],[297,363]];

    for(let t in torchLocations) {
      let loc = torchLocations[t];
      let paintingLoc = paintingLocations[t];
      let torch = new Torch(this.game, loc[0], loc[1]);
      let painting = this.makeCavePainting(paintingLoc[0],paintingLoc[1],paintingNames[t]);
      if (stateManager.get(STATE_DONE_CAVE_TORCHES)) {
        painting.play('on');
        torch.sprite.play('on');
        torch.didLight = true;
      }
      else {
        torch.on('lit', async () => {
          numTorchesLit++;
          painting.play('on');
          if (numTorchesLit === torchLocations.length) {
            console.log('DONE ALL TORCHES');
            stateManager.set(STATE_DONE_CAVE_TORCHES,true);
            await sleep(800);
            await this.openCaveDoor(true);
          }
        });
      }

      this.spriteContainer.addChild(torch.sprite);
    }


    let doorX = this.game.world.width/2;
    let doorY = this.game.world.height-47;
    let doorBack = this.game.add.sprite(doorX,doorY,'cave-door-back');
    doorBack.z = 3;
    doorBack.anchor.setTo(0.5,1);
    let door = this.game.add.sprite(doorX,doorY,'cave-door');
    door.anchor.setTo(0.5,1);
    door.animations.add('rest',[0],1,false).play();
    door.animations.add('open', linearArray(0,13), 15, false);
    door.z = 5;
    this.door = door;

    this.spriteContainer.addChild(doorBack);
    this.spriteContainer.addChild(door);

    this.spriteContainer.children.sort( (s1, s2) => {
      return (s1.z > s2.z ? 1 : -1);
    });

    if (stateManager.get(STATE_DONE_CAVE_TORCHES)) {
      this.openCaveDoor(false);
    }

    audioManager.stop(AUDIO_PATH_FIRST_SCENE);
    audioManager.play(AUDIO_PATH_CAVE_SCENE,1,true);
  }

  async openCaveDoor(focus) {

    let prevCamX = this.game.camera.view.centerX;
    let prevCamY = this.game.camera.view.centerY;

    if (focus) {
      this.inputEnabled = false;
      // this.wideScreen.show();
      cameraController.isZoomFocused = true;
      await tweenPromise(this.game, this.game.camera.view, {centerX : this.door.x, centerY : this.door.y}, 2000);
    }

    let orb = this.addOrb(this.door.x, this.door.y - this.door.height/2 + 10, 9);
    if (typeof orb !== 'undefined') {
      orb.sprite.z = 4;
      this.spriteContainer.addChild(orb.sprite);
      this.spriteContainer.children.sort( (s1, s2) => {
        return (s1.z > s2.z ? 1 : -1);
      });
    }


    await animationPromise(this.door,'open');

    if (focus) {
      await sleep(2000);
      await tweenPromise(this.game, this.game.camera.view, {centerX : prevCamX, centerY : prevCamY}, 2000);
      // cameraController.resetToPlayer();
      cameraController.isZoomFocused = false;
      this.inputEnabled = true;
    }

  }

  makeCavePainting(x,y,name) {
    let s = this.game.make.sprite(x,y,name);
    s.anchor.setTo(0.5,0.5);
    s.animations.add('on',linearArray(0,10),15,false);
    s.animations.add('off',[0],1,false).play();
    this.spriteContainer.addChild(s);
    return s;
  }

  update() {
    super.update();
  }
}

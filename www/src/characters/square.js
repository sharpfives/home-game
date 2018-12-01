'use strict';

class SquareCharacter extends Character {
  constructor(game,x,y) {
    super(game,x,y);

    let box = this.game.add.sprite(x,y,'box');
    box.animations.add('rest',[0],1,false).play();
    box.animations.add('bounce-up',[0,1,2,3],20,false);
    box.animations.add('bounce-down',[4,5,6],20,false);

    // box.anchor.setTo(0.5,0.5);
    this.game.physics.p2.enable(box,DEBUG_PHYSICS);
    this.sprite = box;
    box.body.fixedRotation = true;
    // box.body.onCollide = new Phaser.Signal();
    // box.body.onCollide.add(async (sprite1, sprite2) => {
    //   console.log(`collided ${sprite1.key} ${sprite2.key}`);
    //
    //   // console.log(`on floor = ${this.sprite.body.onFloor()}`);
    //
    //   if (this.isOffGround) {
    //     this.isOffGround = false;
    //     await this.playAnimation('bounce-down');
    //   }
    // }, this);

    box.body.onBeginContact.add(async (body,s) => {
      if (body == null) {
        return;
      }

      let otherSprite = body.sprite;
      // console.log(`${layerSprite.key} hit ${otherSprite.key}`);
      // if (typeof otherSprite.character === 'undefined') {
      //   console.error(`otherSprite ${otherSprite.key} does not have a character object`);
      //   return;
      // }
      if (this.isOffGround) {
        this.isOffGround = false;
        await this.playAnimation('bounce-down');
      }

    }, this);
    this.vx = 25;
  }

  moveRight() {
    this.sprite.body.velocity.x = this.vx;
  }

  moveLeft() {
    this.sprite.body.velocity.x = -this.vx;
  }

  rest() {
    this.sprite.body.velocity.x = 0;
    // this.playAnimation('rest');
  }

  async jump() {
    if (this.isOffGround)
      return;

    await this.playAnimation('bounce-up');
    this.sprite.body.velocity.y = -100;
    // await sleep(100);
    this.isOffGround = true;

  }
}

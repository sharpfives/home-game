'use strict';

class Bird extends Character {
  constructor(game,x,y) {
    super(game);
    let bird = this.game.add.sprite(x,y,'bat-flap');
    bird.type = 'bird';
    bird.animations.add('rest',[0],1,false);
    bird.animations.add('fly',linearArray(0,9),15,true);
    bird.play('fly');
    this.game.physics.p2.enable(bird, DEBUG_SPRITE_POLYGONS);
    bird.body.static = true;
    bird.body.immovable = true;
    bird.body.fixedRotation = true;

    for (let n in bird.body.data.shapes) {
      bird.body.data.shapes[n].sensor = true;
    }

    bird.body.onBeginContact.add( (body1, bodyB, shapeA, shapeB, equation) => {
      if (body1 == null) {
        return;
      }
      let otherSprite = body1.sprite;
      if (typeof otherSprite === 'undefined' || otherSprite == null)
        return;
      if (otherSprite.type === 'player') {
        // bird.play('fly');
        // bird.body.clearShapes();
        // bird.body.velocity.x = 200;
        // bird.body.velocity.y = -200;
        if (!this.caughtPlayer) {
          this.caughtPlayer = true;
          this.emit('caught-player');
          this.isDiving = false;
        }

        this.caughtPlayer = true;
      }
    });

    this.sprite = bird;

    this.startLoc = [rand(100,300), rand(120,160)];
  }

  async start(delay) {
    await sleep(delay);
    // await this.circle();
    // await this.dive();
    // let timeToNextDive = 6;//rand(3,6);
    // this.game.time.events.add(Phaser.Timer.SECOND * timeToNextDive, this.start, this);
    let timer = this.game.time.create(false);
    timer.loop(4000, () => {
      this.dive();
    });
    timer.start();
  }


  async dive() {
    // let me = this.game.me;
    // let returnX = rand(100,300);
    // let returnY = 160; // rand
    // // if (me.x() > 65) {
    this.isDiving = true;
    await sleep(4000);
    this.isDiving = false;
    // await tweenPromise(this.game, this.sprite.body, {x : returnX, y : returnY}, 1000, 0, Phaser.Easing.Linear.None);
    // this.sprite.body.setZeroVelocity();

    // }

  }

  async circle() {
    // await sleep(1000);
    this.sprite.body.setZeroVelocity();
  }

  update() {
    let me = this.game.me;
    let toX = me.x(); let toY = me.y();
    if (me.x() < 65 || me.x() > 370) {
      toX = this.startLoc[0];
      toY = this.startLoc[1];
    }
    else if (this.caughtPlayer) {
      toX = rand(100,300);
      toY = 100;
    }
    else if (!this.isDiving){
      toX = me.x();
      toY = 160;
    }

    let meX = this.sprite.body.x;
    let meY = this.sprite.body.y;

    let velocity = (this.isDiving ? 60 : 40);
    let angle = Math.atan2(toY - meY, toX - meX);
    let vx = velocity * Math.cos(angle);
    let vy = velocity * Math.sin(angle);
    // console.log(`vx : ${vx}, vy : ${vy}`);

    if (toX < meX) {
      this.faceRight();
    }
    else {
      this.faceLeft();
    }

    this.sprite.body.velocity.x = vx;
    this.sprite.body.velocity.y = vy;

    if(this.caughtPlayer) {
      me.sprite.body.x = this.sprite.body.x;
      me.sprite.body.y = this.sprite.body.y;
    }
  }

}

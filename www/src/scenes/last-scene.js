'use strict';

class LastScene extends SceneBase {
  constructor() {
    super();

    this.cameraOffsets = [
      {
        x : 0,
        offset : [0,-20]
      },
      {
        x : 320,
        offset : [0,-30]
      },
      {
        x : 626,
        offset : [0,10]
      }
    ];

    this.xCrossOver = 370;
  }

  preload() {
    super.preload();
    ChurchTower.loadResources(this.game);
    this.game.load.spritesheet('bat-flap','resources/images/bat-flap.png',11,10,7);
    this.game.load.spritesheet('bird','resources/images/small-bird.png',6,7,7);
    this.game.load.image('water-reflection-end','resources/images/scenes/water-reflection-end.png');

  }

  create() {
    super.create();

    let waterReflection = new WaterEffectOverlay(this.game,712,248,'water-reflection-end');
    this.spriteContainer.addChild(waterReflection.sprite);

    let me = this.game.me;
    me.setWheel();

    me.on('hit-church-tower', async (tower) => {
      if (!this.hitTower && tower.isBroken) {
        this.hitTower = true;
        this.inputEnabled = false;
        await me.playAnimation('flat');
        await sleep(1000);
        await this.savePlayer(me.x(), me.y(), this.xCrossOver + 20, 200, 1000);
        me.rest();
        this.inputEnabled = true;
        this.hitTower = false;
        tower.reset();
      }
    });

    // tower.breakUp();

    this.towers = [
      new ChurchTower(this.game,450,176,1),
      new ChurchTower(this.game,552,190,2),
      new ChurchTower(this.game,433,187,3),
      new ChurchTower(this.game,522,180,4)
    ];

    let numBirds = 5;
    this.birds = [];
    for(let k = 0; k < numBirds; k++) {
      let bird = new Bird(this.game,100,200);
      bird.on('caught-player', async () => {
        this.inputEnabled = false;
        await sleep(1500);
        bird.caughtPlayer = false;
        let coord = (this.cameFromRight ? [this.xCrossOver + 20, 200] : [25, 270]);
        await this.savePlayer(me.x(),me.y(), coord[0], coord[1]);
        me.rest();
        this.inputEnabled = true;
      });
      bird.start(k*100);
      this.birds.push(bird);
    }

    this.addOrb(192, 252, 6);

    this.offShoreOrbLocation = [740,240];
    this.addOrb(this.offShoreOrbLocation[0], this.offShoreOrbLocation[1], 7);

    audioManager.play(AUDIO_PATH_BIRD_WINGS_FX,0.5,true);

    audioManager.stop(AUDIO_PATH_SECOND_SCENE);
    audioManager.play(AUDIO_PATH_LAST_SCENE,1,true);
    // this.rain();
  }

  rain() {
    setInterval( () => {
      // let xVar = 40;
      let particle = this.game.add.sprite(rand(0,300),2,'particle');
      this.spriteContainer.addChild(particle);
      this.game.physics.p2.enable(particle, DEBUG_SPRITE_POLYGONS);
      particle.body.velocity.y = 5;
      particle.body.velocity.x = 30;
      particle.body.onBeginContact.add((body1,s) => {
        particle.destroy();
      }, this);
    },100);
  };

  makeBird(x,y) {
    let bird = this.game.add.sprite(x,y,'bird');
    bird.type = 'bird';
    bird.animations.add('rest',[0],1,false);
    bird.animations.add('fly',linearArray(0,9),15,true);
    bird.play('fly');
    this.game.physics.p2.enable(bird, DEBUG_SPRITE_POLYGONS);
    bird.body.static = true;
    bird.body.fixedRotation = true;

    bird.body.onBeginContact.add( (body1, bodyB, shapeA, shapeB, equation) => {
      if (body1 == null) {
        return;
      }
      let otherSprite = body1.sprite;
      if (typeof otherSprite === 'undefined')
        return;
      if (otherSprite.type === 'player') {
        bird.body.clearShapes();
        bird.body.velocity.x = 200;
        bird.body.velocity.y = -200;

      }
    });
    return bird;
  }

  update() {
    super.update();
    let me = this.game.me;

    this.birds.forEach( (b,i) => {
      b.update();

      if (i === 0) {
        let bx = b.sprite.body.x; let by = b.sprite.body.y;
        let dist = Math.sqrt((me.x() - bx)*(me.x() - bx) + (me.y() - by)*(me.y() - by));
        let maxDist = 150;
        console.log(dist);
        let vol = Math.max(0,Math.min(0.5,1 - dist/maxDist));
        audioManager.setVolume(AUDIO_PATH_BIRD_WINGS_FX,vol);
      }

    });

    if (this.stuckToBird) {
      this.inputEnabled = false;
      // me.sprite.body.x = b
    }


    this.towers.forEach( (t) => {
      if (t.isBroken)
        return;
      if (me.x() > t.x + 10) {
        t.breakUp();
        t.isBroken = true;
      }
    });

    if (me.x() > this.xCrossOver) {
      this.cameFromRight = true;
    }

    if (me.y() > this.game.world.height) {
      if (!this.didFallIn) {
        this.didFallIn = true;
        let save = async () => {
          await sleep(200);
          // me.followingOrbs.forEach( (o) => {
          //   if (o.number === 7) {
          //     o.sprite.body.x = this.offShoreOrbLocation[0];
          //     o.sprite.body.y = this.offShoreOrbLocation[1];
          //   }
          // });
          await this.savePlayer(me.x(), me.y(), 665, 210, 1000);
          this.didFallIn = false;
        };
        save();
      }
    }
  }
}

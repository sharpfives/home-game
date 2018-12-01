'use strict';

class CraterScene extends SceneBase {
  constructor() {
    super();
  }

  preload() {
    super.preload();
    this.game.load.image('big-rock','resources/images/big-rock.png');

    if (DEBUG_SCENE) {
      stateManager.set(STATE_START_DID_FALL_IN,true);
      stateManager.set(STATE_HAS_BOOST,true);
      stateManager.set(STATE_HAS_DRILL,true);
      stateManager.set(STATE_HAS_DASH,true);
      // stateManager.set(orbFollowing(),4);

    }
  }

  create() {
    super.create();

    let me = this.game.me;
    me.on('hit-rock', async () => {
      if (!this.hitRock) {
        this.hitRock = true;
        // this.inputEnabled = false;
        await me.playAnimation('flat');
        await sleep(1000);
        this.hitRock = false;

        let coord = (this.cameFromRight ? [this.game.world.width - 30, 10] : [30, 95]);
        await this.savePlayer(me.x(),me.y(), coord[0], coord[1], 2000);
        me.rest();
        if (this.cameFromRight)
          me.faceRight();
        else
          me.faceLeft();
      }
    });
    me.setWheel();

    this.cursors = this.game.input.keyboard.createCursorKeys();

    let timer = this.game.time.create(false);
    let time = 10000;

    timer.loop(time, () => {
      let rock = new BigRock(this.game,this.game.world.width - 20,-10);
      this.rock = rock;
    });
    timer.start();

    let ventLocations = [110,230,270,313,355];
    for(let v in ventLocations) {
      let steamVent = new SteamVentCloud(this.game, ventLocations[v], this.game.world.height+10);
      steamVent.start(rand(500,2000));
    }


    this.addOrb(230, 70, 4);
    this.addOrb(309, 70, 5);
    this.addOrb(427, 234, 8);

    this.cameFromRight = (this.exitName !== 'left');

    audioManager.stop(AUDIO_PATH_BIRD_WINGS_FX);
    audioManager.stop(AUDIO_PATH_LAST_SCENE);
    audioManager.play(AUDIO_PATH_SECOND_SCENE,1,true);

  }

  update() {
    super.update();
    let me = this.game.me;
    if (typeof this.rock !== 'undefined') {
      if (this.rock.sprite.body != null) {
        if (this.rock.sprite.body.y > this.game.world.height + 30) {
          this.rock.sprite.destroy();
        }
        else {
          this.rock.sprite.bringToTop();
        }
      }
    }

    if (me.y() > this.game.world.height) {
      console.log('ooooops');
      if (!this.didFallIn) {
        this.didFallIn = true;
        let save = async () => {
          await sleep(200);

          let coord = (this.cameFromRight ? [this.game.world.width - 30, 10] : [30, 95]);
          await this.savePlayer(me.x(),me.y(), coord[0], coord[1], 2000);
          me.rest();
          if (this.cameFromRight)
            me.faceRight();
          else
            me.faceLeft();

          this.didFallIn = false;
        };
        save();
      }
    }
  }
}

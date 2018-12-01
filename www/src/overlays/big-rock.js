'use strict';

class BigRock extends EventEmitter {
  constructor(game,x,y) {
    super();
    this.game = game;

    let rock = this.game.add.sprite(x,y,'big-rock');
    rock.type = 'big-rock';
    this.game.physics.p2.enable(rock, DEBUG_SPRITE_POLYGONS);
    rock.body.clearShapes();
    rock.body.loadPolygon('physicsData', 'big-rock');
    rock.body.onBeginContact.add((body1, bodyB, shapeA, shapeB, equation) => {

      if (body1 == null) {
        return;
      }

      let otherSprite = body1.sprite;

      if (typeof otherSprite === 'undefined')
        return;

      if (otherSprite.type === 'ground') {
        let me = this.game.me;
        let vol = Math.max(0,Math.min(1,me.x() / 380) - 0.1);
        audioManager.play(AUDIO_PATH_BIG_ROCK_FX,vol);
        cameraController.shake(50,3);
      }
    });
    this.sprite = rock;
  }
}

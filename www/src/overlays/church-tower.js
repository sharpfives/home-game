'use strict';

class ChurchTower extends EventEmitter {
  constructor(game,x,y,which) {
    super();
    which = (typeof which === 'undefined' ? 1 : which);
    this.game = game;
    this.x = x; this.y = y; this.which = which;
    this.setup();
  }

  reset() {
    this.isBroken = false;
    this.pieces.forEach( (p) => {
      p.destroy();
    });
    this.setup();
  }

  setup() {
    let which = this.which;
    let x = this.x;
    let y = this.y;
    let numPieces = ChurchTower.pieceCounts[which-1];

    this.pieces = [];
    for(let k = 0; k < numPieces; k++) {
      let spriteName = 'church-tower-' + which + '-' + (k + 1) + '_1';
      let s = this.game.add.sprite(x,y,spriteName);
      s.type = 'church-tower';
      s.obj = this;
      s.anchor.setTo(0,0);
      this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
      s.body.clearShapes();
      try {
        s.body.loadPolygon('physicsData', spriteName);
        for (let n in s.body.data.shapes) {
          s.body.data.shapes[n].sensor = true;
        }
        // p.sensor = true;
      } catch (e) {}
      // s.body.mass = 1000000;
      s.body.static = true;
      s.body.onBeginContact.add( (body1, bodyB, shapeA, shapeB, equation) => {
        // audioManager.play(AUDIO_PATH_BIG_ROCK_FX,0.2);
      });

      // s.body.kinematic = true;
      // s.body.gravity.y = 2;

      this.pieces.push(s);
      // s.body.addCircle(2,0,0);
      // s.body.fixedRotation = true;
      // s.body.static = true;
      // sprite.addChild(s);
    }

  }

  async breakUp() {
    let pieces = this.pieces;
    for(let p in pieces) {
      let body = pieces[p].body;
      body.static = false;
      for (let n in body.data.shapes) {
        body.data.shapes[n].sensor = false;
      }
    }
    await sleep(3000);
    for(let p in pieces) {
      pieces[p].body.clearShapes();
    }
  }

  static loadResources(game) {
    ChurchTower.pieceCounts = [3,2,2,3];

    for(let n in ChurchTower.pieceCounts) {
      let pieces = ChurchTower.pieceCounts[n];
      let towerIndex = Number(n) + 1;
      for(let k = 0; k < pieces; k++) {
        game.load.image('church-tower-' + towerIndex + '-' + (k+1) + '_1', 'resources/images/church-tower-' + towerIndex + '/church-tower-' +  towerIndex + '-' + (k + 1) + '_1.png');
      }
    }

  }
}

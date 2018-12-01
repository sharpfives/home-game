'use strict';

class TowerArm extends EventEmitter {
  constructor(game,x,y,which) {
    super();
    which = (typeof which === 'undefined' ? 1 : which);
    this.game = game;
    this.x = x; this.y = y; this.which = which;
    this.setup();

  }

  setup() {
    let which = this.which;
    let x = this.x;
    let y = this.y;
    let numPieces = TowerArm.pieceCounts[which-1];

    this.pieces = [];
    this.didBreak = false;

    for(let k = 0; k < numPieces; k++) {
      let spriteName = 'tower-piece-' + which + '-' + (k + 1) + '_1';
      let s = this.game.add.sprite(x,y,spriteName);
      s.anchor.setTo(0,0);
      this.game.physics.p2.enable(s, DEBUG_SPRITE_POLYGONS);
      s.body.clearShapes();
      if (which !== 2 || k === 0) {
        try {
          s.body.loadPolygon('physicsData', spriteName);
        } catch (e) {}
      }

      s.body.mass = 1000000;
      s.body.static = true;
      // s.body.gravity.y = 2;
      if (k == 0) {
        s.body.onBeginContact.add( async (body1, bodyB, shapeA, shapeB, equation) => {
          if (body1 == null) {
            return;
          }
          let otherSprite = body1.sprite;
          if (typeof otherSprite === 'undefined')
            return;
          if (otherSprite == null) {
            return;
          }
          if (otherSprite.type !== 'player' || this.didBreak) {
            return;
          }

          this.didBreak = true;
          let me = this.game.me;
          me.isJumping = false;
          me.isRocketing = false;
          me.isDrilling = false;

          await sleep(200);
          for(let p in this.pieces) {
            this.pieces[p].body.static = false;
          }
          await sleep(2500);
          for(let p in this.pieces) {
            this.pieces[p].body.clearShapes();
          }
          await sleep(4000);
          for(let p in this.pieces) {
            this.pieces[p].destroy();
          }
          this.setup();
        });
      }
      this.pieces.push(s);

    }
  }

  static loadResources(game) {

    TowerArm.pieceCounts = [5,9];

    for(let n in TowerArm.pieceCounts) {
      let pieces = TowerArm.pieceCounts[n];
      let towerIndex = Number(n) + 1;
      for(let k = 0; k < pieces; k++) {
        game.load.image('tower-piece-' + towerIndex + '-' + (k+1) + '_1', 'resources/images/tower-arm-pieces' + towerIndex + '/tower-piece-' +  towerIndex + '-' + (k + 1) + '_1.png');
      }
    }

    // for(let k = 0; k < 5; k++) {
    //   game.load.image('tower-piece-1-' + (k+1) + '_1', 'resources/images/tower-arm-pieces1/tower-piece-1-' + (k + 1) + '_1.png');
    // }

    // for(let k = 0; k < 9; k++) {
    //   game.load.image('tower-piece-2-' + (k+1) + '_1', 'resources/images/tower-arm-pieces2/tower-piece-2-' + (k + 1) + '_1.png');
    // }
  }
}

'use strict';

class MainSceneState extends Phaser.State {
  constructor() {
    super();
    this.updateIndex = 0;
  }

  init(scene) {
    super.init(scene);
  }

  preload() {
    super.preload();

    // this.game.load.tilemap('tilemap', 'resources/tilemap/tilemap3.json', null, Phaser.Tilemap.TILED_JSON);
    // this.game.load.image('gameTiles', 'resources/tilemap/tileset.png');

    let me = new Player(this.game)
    me.loadResources();
    this.game.me = me;

    let ghost = new Ghost(this.game);
    ghost.loadResources();
    this.game.ghost = ghost;

    let physicsFile = 'resources/ground-test.json';
    this.game.load.physics('physicsData', physicsFile);

    this.game.load.bitmapFont('test', 'resources/font-tight.png', 'resources/font-tight.xml');
    this.game.load.bitmapFont('test2', 'resources/super-low-font-tight.png', 'resources/super-low-font-tight.xml');

    //  Note that the XML file should be saved with UTF-8 encoding or some browsers (such as Firefox) won't load it.

    //  There are various tools that can create Bitmap Fonts and the XML file needed.
    //  On Windows you can use the free app BMFont: http://www.angelcode.com/products/bmfont/
    //  On OS X we recommend Glyph Designer: http://www.71squared.com/en/glyphdesigner

    this.game.load.image('ground','resources/first-scene/ground_1.png');
    // this.game.load.image('box','resources/box-3x3.png');
    this.game.load.spritesheet('box','resources/square-bounce.png',7,5,7);

    // this.game.load.spritesheet('player', 'resources/images/characters/alien/body.png', 15, 15, 13);

    // this.game.load.image('piston','resources/piston.png');
    // this.game.load.spritesheet('rocket','resources/rocket-animated.png',7,9,6);
    // this.game.load.image('rock1','resources/rock1.png');
    // this.game.load.image('play-button','resources/play-button.png');
    // this.game.load.image('restart','resources/restart.png');
    // this.game.load.image('timeline-cursor','resources/timeline-cursor.png');
    // this.game.load.image('particle','resources/square-particle-1x1.png');

    // this.game.load.spritesheet('piston-bounce','resources/piston-bounce.png',7,7,7);
    // this.game.load.spritesheet('rocket-icon','resources/rocket-icon.png',7,9,5);

  }

  create() {
    super.create();

    let me = this.game.me;

    let debugPhysics = false;


    // let map = this.game.add.tilemap('tilemap');
    // map.anchor.setTo(0.5,0.5);
    // map.addTilesetImage('tileset','gameTiles');
    // let layer = map.createLayer('Tile Layer 1');
//
    //  This resizes the game world to match the layer dimensions
    // layer.resizeWorld();
    // map.setCollisionBetween(1, 12);
    // this.ground = layer;

    this.game.stage.backgroundColor = '#a7a7a7';
    // this.game.stage.backgroundColor = '#000000';

    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    let worldHeight = 128;
    this.game.world.setBounds(0,0,64,worldHeight);
    // this.game.world.resize(64,worldHeight);

    // let text2 = this.game.add.bitmapText(15, 15, 'test2','hi', 5);
    let physicsType = Phaser.Physics.P2JS;
    // let physicsType = Phaser.Physics.ARCADE;
    this.game.physics.startSystem(physicsType);
    this.game.physics.p2.setImpactEvents(true);
    this.game.physics.p2.restitution = 0;
    this.game.physics.p2.gravity.y = 100;
    // this.game.physics.arcade.gravity.y = 0;

    // this.game.physics.p2.convertTilemap(map, layer);
    // this.game.physics.p2.convertCollisionObjects(map, layer);
    this.game.physics.p2.setBoundsToWorld(true, true, false, false);

    let groundLevel = 0;
    let ground = this.game.add.sprite(0,groundLevel,'ground');
    this.game.physics.p2.enable(ground, DEBUG_PHYSICS);
    ground.body.clearShapes();
    ground.body.loadPolygon('physicsData', 'ground_1');
    // ground.anchor.x = 0.5;
    ground.body.static = true;
    // ground.body.kinematic = true;
    ground.body.x = ground.width/2;
    ground.body.y = ground.height/2;
    this.ground = ground;

    //
    // // let groundMaterial = this.game.physics.p2.createMaterial('groundMaterial', ground.body);
    // this.ground = ground;

    // let square = new SquareCharacter(this.game,20,5);
    // this.square = square;
    // let boxMaterial = this.game.physics.p2.createMaterial('boxMaterial', robot.body.sprite.body);
    // let contactMaterial = this.game.physics.p2.createContactMaterial(boxMaterial, groundMaterial);
    //
    // contactMaterial.friction = 0.3;     // Friction to use in the contact of these two materials.
    // contactMaterial.restitution = 0;  // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
    // contactMaterial.stiffness = 1e7;    // Stiffness of the resulting ContactEquation that this ContactMaterial generate.
    // contactMaterial.relaxation = 3;     // Relaxation of the resulting ContactEquation that this ContactMaterial generate.
    // contactMaterial.frictionStiffness = 1e7;    // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    // contactMaterial.frictionRelaxation = 3;     // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    // contactMaterial.surfaceVelocity = 0;        // Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.

    // smallRock.sprite.anchor.setTo(0.2,0.5);

    this.game.input.keyboard.onDownCallback = async (event) => {
      console.log(`Down ${event}`);
      let key = event.code;
      if (key === 'ArrowUp') {
        // this.square.jump();
        if (!me.isOffGround) {
          await me.playAnimation('bounce-up');
          me.sprite.body.velocity.y = -100;
          // this.isOffGround = true;
        }

      }
      else if (key === 'ArrowRight') {
        // this.square.moveRight();
      }
    };


    me.setup({});

    let spriteContainer = this.game.add.sprite(0,0);
    spriteContainer.addChild(me.sprite);

    me.sprite.body.x = 30;
    me.sprite.body.y = 30;

    let ghost = this.game.ghost;
    ghost.setup({});
    ghost.sprite.body.x = 40;
    ghost.sprite.body.y = 30;


    spriteContainer.addChild(ghost.sprite);

    ghost.playAnimation('rest');
    
    ghost.sprite.body.velocity.x = 10;
    // ghost.sprite.body.x = 40;
    // ghost.sprite.body.y = 40;
    //
    // ghost.playAnimation('rest');
    // let playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
    // let groundCollisionGroup = this.game.physics.p2.createCollisionGroup();

    // me.sprite.body.setCollisionGroup(playerCollisionGroup);
    // ground.body.setCollisionGroup(groundCollisionGroup);
    // ground.body.collides([playerCollisionGroup, groundCollisionGroup]);
    // me.sprite.body.collides(groundCollisionGroup, () => {
    //
    // }, this);

    // let simple = new Player();
    // simple.add
    // this.game.physics.p2.enable(simple, DEBUG_PHYSICS);
    //
    // simple.body.clearShapes();
    // simple.body.addRectangle(10,10,0,0);
    // simple.body.fixedRotation = true;
    // this.player = simple;

    // simple.body.immovable = true;
    // this.game.camera.follow(simple);
    // timeline.setPart(robot.piston);

    this.cursors = this.game.input.keyboard.createCursorKeys();


  }

  update() {
    super.update();

    let me = this.game.me;

    if (this.cursors.left.isDown) {
      // if (!me.isOffGround)
        me.playAnimation('wheel');
      me.sprite.body.velocity.x = -30;
    }
    else if (this.cursors.right.isDown) {
      // if (!me.isOffGround)
        me.playAnimation('wheel');
      me.sprite.body.velocity.x = 30;
    }
    else if (this.cursors.up.isDown) {
      // me.sprite.body.velocity.y =
    }
    else if (this.cursors.down.isDown) {
      // this.square.moveRight();
    }
    else {
      // if (!me.isOffGround)
        me.playAnimation('rest');
      me.sprite.body.velocity.x = 0;
    }
  }
}

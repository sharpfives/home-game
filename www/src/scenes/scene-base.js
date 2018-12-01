'use strict';

class SceneBase extends Phaser.State {
  constructor() {
    super();

    this.inputEnabled = true;

    this.cameraOffsets = [
      {
        x : 0,
        offset : [0,0]
      }
    ];
  }

  init(scene) {
    super.init(scene);
  }

  static configName() {
    return 'un-named scene';
  }

  preload() {
    super.preload();

    Player.loadResources(this.game);
    Ghost.loadResources(this.game);

    this.game.load.image('grass1','resources/images/grass1.png');
    this.game.load.image('grass2','resources/images/grass2.png');
    this.game.load.image('grass3','resources/images/grass3.png');
    this.game.load.image('grass4','resources/images/grass4.png');

    this.game.load.image('particle','resources/images/square-particle-1x1.png');
    this.game.load.image('particle-3x3','resources/images/particle-3x3.png');
    this.game.load.image('breakable-ground-tile','resources/images/breakable-ground-tile.png');
    this.game.load.spritesheet('rocket-flame','resources/images/flames.png',64,34,9);
    this.game.load.spritesheet('dash-flame','resources/images/dash-flame.png',25,10,5);

    this.game.load.physics('globalPhysicsData', 'resources/config/global-physics.json');

    let sceneData = this.sceneData; //game.cache.getJSON(this.constructor.configName());

    // let sceneData = this.game.cache.getJSON(this.constructor.configName());
    // this.sceneData = sceneData;

    let physicsFile = sceneData.physicsFile;
    if (typeof physicsFile !== 'undefined') {
      this.game.load.physics('physicsData', physicsFile);
    }

    let rootDir = (typeof sceneData.background.rootDir !== 'undefined' ? sceneData.background.rootDir : '');

    for (let i in sceneData.background.layers) {
      let layer = sceneData.background.layers[i];

      if (typeof layer.spritesheet !== 'undefined' && typeof layer.label !== 'undefined') {
        let spriteDetails = layer.spritesheet;
        this.game.load.spritesheet(layer.label, rootDir + '/' + layer.imagePath, spriteDetails.width, spriteDetails.height, spriteDetails.numSprites);
      }
      else if (typeof layer.imagePath !== 'undefined' && typeof layer.label !== 'undefined') {
        this.game.load.image(layer.label,rootDir + '/' + layer.imagePath);
      }
      else {
        console.log(`could be an issue loading layer with label ${layer.label}`);
      }

    }

    if (DEBUG_SCENE) {
      stateManager.set(STATE_HAS_BOOST,true);
      stateManager.set(STATE_HAS_DRILL,true);
      stateManager.set(STATE_HAS_DASH,true);
      stateManager.set(STATE_START_DID_FALL_IN,true);
    }

  }

  create() {
    super.create();

    this.game.stage.backgroundColor = '#e7e7e7';
    // this.game.stage.backgroundColor = '#a7a7a7';

    // this.game.stage.backgroundColor = '#000000';

    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    // Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    // let ctx = this.game.canvas.getContext('2d');
    // ctx.mozImageSmoothingEnabled = false;
    // ctx.imageSmoothingQuality = "low";
    // ctx.webkitImageSmoothingEnabled = false;
    // ctx.msImageSmoothingEnabled = false;
    // ctx.imageSmoothingEnabled = false;

    // let worldHeight = 200;
    // this.game.world.setBounds(0,0,64,worldHeight);
    // this.game.world.resize(64,worldHeight);

    // let text2 = this.game.add.bitmapText(15, 15, 'test2','hi', 5);
    let physicsType = Phaser.Physics.P2JS;
    this.game.physics.startSystem(physicsType);
    this.game.physics.p2.setImpactEvents(true);
    this.game.physics.p2.restitution = 0.0;
    this.game.physics.p2.gravity.y = 230;
    this.game.physics.p2.setBoundsToWorld(false, false, false, false);
    this.game.physics.p2.setPostBroadphaseCallback( (body1, body2) => {
      if (body1.sprite == null || body2.sprite == null) {
        return true;
      }

      if (body1.sprite.key === 'player' && body2.sprite.type === 'platform') {
        if (body1.velocity.y <= 0.0000001) {
          return false;
        }
      }
      else if (body2.sprite.key === 'player' && body1.sprite.type === 'platform') {
        if (body2.velocity.y <= 0.0000001) {
          return false;
        }
      }

      return true;
    }, this);

    this.game.onFocus.add( () => {
      window.focus();
    }, this);

    let me = new Player(this.game);
    me.setup({});
    me.sprite.z = 200;
    // me.setWheel();

    this.game.me = me;
    let spriteMaterial = this.game.physics.p2.createMaterial('spriteMaterial', me.sprite.body);

    let sceneData = this.sceneData;
    // let sceneData = this.game.cache.getJSON(this.constructor.configName());
    let spriteContainer = this.game.add.sprite(0,0);
    this.spriteContainer = spriteContainer;

    // let backgroundCollisionGroup = this.game.physics.p2.createCollisionGroup();
    // backgroundCollisionGroup.tag = "ground";
    // this.backgroundCollisionGroup = backgroundCollisionGroup;
    // let playerCollisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();


    let z = 1;
    for (let i in sceneData.background.layers) {
      let layer = sceneData.background.layers[i];
      let spriteBackground = this.game.make.sprite(0, 0, layer.label);
      // spriteBackground.inputEnabled = true;
      // spriteBackground.input.priorityID = 0; // lower priority
      spriteBackground.smoothed = false;

      if (layer.type === 'breakable') {
        let bmd = this.game.make.bitmapData(spriteBackground.width,spriteBackground.height);
        bmd.clear();
        bmd.update();
        bmd.draw(layer.label,0,0);
        bmd.dirty = true;
        bmd.update();
        bmd.render();
        let brickResolution = 4;
        for(let i = 0; i < spriteBackground.width/brickResolution; i++) {
          let xCoord = i * brickResolution;
          for(let j = 0; j < spriteBackground.height/brickResolution; j++) {
            let yCoord = j * brickResolution;
            let color = bmd.getPixelRGB(xCoord, yCoord);
            if (color.a !== 0) {
              let brickSprite = this.game.make.sprite(xCoord + brickResolution/2, yCoord + brickResolution/2, 'breakable-ground-tile');

              // brickSprite.tint = 0x3e3e3e;
              brickSprite.breakable = true;
              brickSprite.type = layer.type;
              this.game.physics.p2.enable(brickSprite, DEBUG_SPRITE_POLYGONS);
              brickSprite.body.clearShapes();
              brickSprite.body.addRectangle(brickResolution, brickResolution, -1,-1);
              brickSprite.body.static = true;

              if (typeof layer.z !== 'undefined'){
                brickSprite.z = layer.z;
              }
              brickSprite.pivot.setTo(0.5,0.5);
              // brickSprite.scale.setTo(1,1);
              spriteContainer.addChild(brickSprite);
            }
          }
        }
      }
      else if (layer.type === 'ground' || layer.type === 'platform'){
        this.game.physics.p2.enable(spriteBackground, DEBUG_SPRITE_POLYGONS);
        spriteBackground.body.clearShapes();

        try {
          spriteBackground.body.loadPolygon('physicsData', layer.label);
        } catch (e) {}
        // spriteBackground.body.mass = 100000;
        // spriteBackground.anchor.x = 0.5;

        spriteBackground.body.immovable = true;
        spriteBackground.body.static = true;

        spriteBackground.body.x = spriteBackground.width/2;
        spriteBackground.body.y = spriteBackground.height/2;

        // spriteBackground.z = 1000000; //(i == 0 ? zStart + i : 400);

        let worldMaterial = this.game.physics.p2.createMaterial('worldMaterial',spriteBackground.body);
        // spriteBackground.body.setMaterial(backgroundMaterial);


        //  Here is the contact material. It's a combination of 2 materials, so whenever shapes with
        //  those 2 materials collide it uses the following settings.
        //  A single material can be used by as many different sprites as you like.
        let contactMaterial = this.game.physics.p2.createContactMaterial(spriteMaterial, worldMaterial);

        contactMaterial.friction = 1e20;     // Friction to use in the contact of these two materials.
        contactMaterial.restitution = 0.0;  // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
        contactMaterial.stiffness = 1e20;    // Stiffness of the resulting ContactEquation that this ContactMaterial generate.
        contactMaterial.relaxation = 10;     // Relaxation of the resulting ContactEquation that this ContactMaterial generate.
        contactMaterial.frictionStiffness = 1e21;    // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
        contactMaterial.frictionRelaxation = 1e12;     // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
        contactMaterial.surfaceVelocity = 0;        // Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.

      }

      if (typeof layer.z !== 'undefined'){
        spriteBackground.z = layer.z;
      }
      else {
        spriteBackground.z = z++;
      }

      if (layer.parallax) {
        spriteBackground.parallax = layer.parallax;
      }

      spriteBackground.type = layer.type;





      // let backgroundMaterial = this.game.physics.p2.createMaterial('backgroundMaterial');
      // this.game.physics.p2.createContactMaterial(playerMaterial, backgroundMaterial, { friction: 10000e5, restitution: 0.0 });

      if (i == 0) {
        // spriteBackground.addChild(playerSprite);
        this.game.world.setBounds(0,0,spriteBackground.width,spriteBackground.height);
      }

      layer.sprite = spriteBackground;
      // layer.physicsData = physicsJSON[layer.label];

      if (layer.type !== 'breakable') {
        spriteContainer.addChild(spriteBackground);
      }

      // spriteBackground.body.setCollisionGroup(backgroundCollisionGroup);
      // spriteBackground.body.collides([playerCollisionGroup, backgroundCollisionGroup]);
    }

    // me.sprite.body.setCollisionGroup(playerCollisionGroup);


    // me.sprite.body.collides(backgroundCollisionGroup);


    this.game.input.keyboard.onUpCallback = async (event) => {
      if (!this.inputEnabled) {
        return;
      }
      console.log(`Down ${event}`);
      let key = event.code;
      let me = this.game.me;
      if (!me.isJumping && !me.isDrilling) {
        me.rest();
      }

    };

    this.game.input.keyboard.onDownCallback = async (event) => {
      if (!this.inputEnabled) {
        console.log('input disabled, returning');
        return;
      }
      let key = event.code;
      console.log(`Down ${key}`);
      if (key === 'ArrowUp') {
        // this.square.jump();
        if (!event.repeat)
          await me.up();

      }
      else if (key === 'ArrowRight') {
        // if (!event.repeat)
        me.moveRight(!event.repeat);
      }
      else if (key === 'ArrowLeft') {
        me.moveLeft(!event.repeat);
      }
      else if (key === 'ArrowDown') {
        await me.down();
      }
    };


    spriteContainer.addChild(me.sprite);

    for(let exitName in sceneData.exits) {
      let exit = sceneData.exits[exitName];

      let type = exit.type;
      if (type === 'left') {
        let width = exit.width;
        let area = {
          x : 0,
          y : 0,
          w : width,
          h : this.game.world.height
        };
        exit.area = area;
      }
      else if (type === 'right') {
        let width = exit.width;
        let area = {
          x : this.game.world.width - width,
          y : 0,
          w : width,
          h : this.game.world.height
        };
        exit.area = area;
      }
    }

    let exitName = this.exitName;
    if (typeof exitName !== 'undefined') {
      let exit = sceneData.exits[exitName];
      if(typeof exit === 'undefined') {
        console.log(`error, no exit to enter with name ${exitName}`);
        return;
      }
      let character = exit.character;

      if(typeof character === 'undefined') {
        console.log(`warning, no character info for exit ${exitName}`);
        return;
      }

      let xOffset = character[0];
      let yOffset = character[1];
      if (exit.type === 'left') {
        xOffset += exit.width;
        me.faceLeft();
      }
      else if (exit.type === 'right') {
        xOffset = (this.game.world.width  - exit.width - xOffset);
        me.faceRight();
      }

      me.sprite.body.x = xOffset;
      me.sprite.body.y = yOffset;

      this.playerStartPosition = [xOffset, yOffset];
    }

    this.isEntering = true;



      // let enter = character.enter;
      // if (typeof enter !== 'undefined') {
      //   let x = coords.x + enter[0];
      //   let y = coords.y + enter[1];
      //   cameraController.resetBuffer();
      //   this.game.me.moveTo(x,y).then( () =>{
      //     this.isEntering = false;
      //     this.game.me.sprite.body.setZeroVelocity();
      //     this.game.me.playAnimation('resting');
      //   });
      // }


    let ghost = new Ghost(this.game);
    ghost.setup({});
    ghost.sprite.body.x = 370;
    ghost.sprite.body.y = 95;
    ghost.sprite.alpha = 0;
    this.game.ghost = ghost;

    let flame = new RocketFlame(this.game);
    this.spriteContainer.addChild(flame.sprite);
    me.on('rocket', () => {
      flame.sprite.bringToTop();
      flame.start(me.x(),me.y() + 10);
    });

    spriteContainer.addChild(ghost.sprite);


    this.cursors = this.game.input.keyboard.createCursorKeys();

    cameraController.game = this.game;




    // this.testIntro();


    // let numClouds = 100;
    // for(let k = 0; k < numClouds; k++) {
    //   let x = Math.random() * this.game.world.width;
    //   let y = 100 * Math.random();
    //   new Cloud(this.game, x, y);
    //
    // }


    this.didExit = false;

    cameraController.resetBuffer();

    // stateManager.set(STATE_NUM_ORBS_FOLLOWING,2);

    console.log(`NUM ORBS : ${stateManager.get(STATE_NUM_ORBS_FOLLOWING)}`);
    let numFollowingOrbs = stateManager.get(STATE_NUM_ORBS_FOLLOWING);
    me.followingOrbs = [];
    let count = 0;
    for(let i = 0; i < 10; i++) {
      let isFollowing = stateManager.get(orbFollowing(i));
      if (!isFollowing)
        continue;
      let orb = new PowerOrb(this.game,me.x(),me.y(),i);
      orb.isFollowing = true;
      orb.startFollow(7 + (count++)*5);
      me.followingOrbs.push(orb);
      this.spriteContainer.addChild(orb.sprite);
      orb.sprite.z = 200;
    }

    // this.sortLayers();

    this.wideScreen = new WideScreenOverlay(this.game);

    this.fadeIn(this.exitName);
  }

  async cinematicZoomFocus(item, thereFunc, ctxt, zoomTime) {
    let currentCameraX = this.game.camera.view.centerX;
    let currentCameraY = this.game.camera.view.centerY;

    await cameraController.focusAndZoom(item, zoomTime);
    await thereFunc.call(ctxt);
    let p1 = tweenPromise(this.game, this.game.camera.view, {centerX : currentCameraX, centerY : currentCameraY}, zoomTime);
    let p2 = tweenPromise(this.game, this.game.camera.scale, {x : 1, y : 1}, zoomTime);

    await Promise.all([p1,p2]);
    cameraController.isZoomFocused = false;
  }

  checkExits() {
    if (this.game == null) {
      return;
    }
    if (this.game.state.current !== this.key) {
      return;
    }
    if (typeof this.sceneData === 'undefined') {
      return;
    }
    let player = this.game.me.sprite;
    for (let exitName in this.sceneData.exits) {
      let exit = this.sceneData.exits[exitName];
      if (typeof exit.area === 'undefined') {
        console.log(`no area defined for exit ${exitName}`);
        continue;
      }
      let area = exit.area;
      let rect = new Phaser.Rectangle(area.x, area.y, area.w, area.h);
      let spriteRect = new Phaser.Rectangle(player.body.x, player.body.y, 1, 1);
      // console.log(`checkExit = ${player.body.x}, ${player.body.y}`);
      // if ((rect.intersects(spriteRect) && this.scene.didExit == false) && !this.isEntering) {
      if ( rect.intersects(spriteRect) && !this.didExit) {

        // if (!this.checkExitStates(exitName)) {
        //   console.log(`exit states not OK`);
        //   return;
        // }
        this.didExit = true;
        console.log(`intersected with exit ${exitName}`);
        let character = exit.character;
        if (typeof character !== 'undefined') {
          let moveDelta = character.exit;
          if (typeof moveDelta !== 'undefined') {
            let me = this.game.me;
            // me.stopMoving();
            let x = me.sprite.body.x; let y = me.sprite.body.y;
            // me.moveTo(x + moveDelta[0], y + moveDelta[1]);
          }
          else {
            console.log(`no exit amount defined for ${exitName}`);
          }
        }
        else {
          console.log(`no character obj defined for ${exitName}`);
        }

        cameraController.resetBuffer();
        this.fadeOut(exitName).then( () => {
          this.game.sceneMap.exit(this.sceneData.name, exitName);
        });

        return;
      }
    }

  }

  updateCameraOffset(xCoord) {

    if (this.ignoreCameraOffset)
      return;

    let offsetY = 0;
    let offsetX = 0;

    for(let k in this.cameraOffsets) {
      let cameraOffset = this.cameraOffsets[k];
      if (xCoord >= cameraOffset.x) {
        offsetX = cameraOffset.offset[0];
        offsetY = cameraOffset.offset[1];
      }
    }

    cameraController.cameraOffsetX = offsetX;
    cameraController.cameraOffsetY = offsetY;

  }

  async savePlayer(startX, startY, endX, endY, returnTime) {
    returnTime = (typeof returnTime === 'undefined' ? 600 : returnTime);
    let ghost = this.game.ghost;
    let me = this.game.me;
    me.sprite.body.clearShapes();
    ghost.sprite.alpha = 1;
    cameraController.isZoomFocused = false;

    ghost.faceLeft();

    me.sprite.alpha = 1;
    me.sprite.body.x = startX;
    me.sprite.body.y = startY;

    ghost.sprite.body.x = startX;
    ghost.sprite.body.y = startY;
    tweenPromise(this.game, me.sprite.body, {x : endX, y : endY}, returnTime, 0, Phaser.Easing.Linear.None);
    await tweenPromise(this.game, ghost.sprite.body, {x : endX + 10, y : endY + 10}, returnTime, 0, Phaser.Easing.Linear.None);
    // await tweenPromise(this.game, ghost.sprite.body, {x : 900, y : 138}, 200, 0, Phaser.Easing.Linear.None);
    me.setWheel();
    me.sprite.body.velocity.y = 0;
    me.sprite.body.velocity.x = 0;

    ghost.sprite.body.velocity.y = 0;
    ghost.sprite.body.velocity.x = 0;
    ghost.sprite.body.x = endX + 10;
    ghost.sprite.body.y = endY + 10;
    // ghost.sprite.body.x = 900;
    // ghost.sprite.body.y = 138;

    // ghost.startParticles();
    await sleep(200);
    await ghost.playAnimation('dont-do-that');
    await sleep(300);
    // ghost.stopParticles();
    await ghost.playAnimation('disappear');
  }

  async fadeOut(exitName) {
    let t = new CloudTransition(this.game);
    this.spriteContainer.addChild(t.sprite);
    // this.game.stage.backgroundColor = '#a7a7a7';
    await t.fadeIn(exitName);
    this.game.stage.backgroundColor = '#e7e7e7';
  }

  async fadeIn(exitName) {
    let t = new CloudTransition(this.game);
    this.spriteContainer.addChild(t.sprite);
    // t.on('start', () => {
      // this.game.stage.backgroundColor = '#a7a7a7';
    // });
    this.game.stage.backgroundColor = '#a7a7a7';
    await t.fadeOut(exitName);
  }

  async dust() {
    if (this.dusting) {
      return;
    }
    this.dusting = true;
    let me = this.game.me;
    let x = me.x();
    let y = me.y();
    let p = new CloudParticle(this.game, x, y + rand(7,9), (me.sprite.body.velocity.x > 0 ? -1 : 1) * rand(0.0,0.2), rand(-0.05,-0.4), 'rgb(52,52,52)', rand(2,4));
    p.on('done', () => {
      p.sprite.destroy();
    });
    let dustInterval = rand(200,600);
    await sleep(dustInterval);
    this.dusting = false;
  }

  spriteWithKey(key) {
    for(let c in this.spriteContainer.children) {
      let s = this.spriteContainer.children[c];
      if (s.key === key) {
        return s;
      }
    };
  }

  addOrb(x,y,number) {
    if (!stateManager.get(orbCollected(number))) {
      let p = new PowerOrb(this.game, x, y, number);
      this.spriteContainer.addChild(p.sprite);
      return p;
    }
  }

  sortLayers() {
    this.spriteContainer.children.sort( (s1, s2) => {
      return (s1.z > s2.z ? 1 : -1);
    });
  }

  update() {
    super.update();

    if (typeof this.cursors === 'undefined') {
      return;
    }

    cameraController.update();

    let me = this.game.me;
    me.sprite.body.velocity.y = Math.max(me.sprite.body.velocity.y, -250);

    let x = me.x();
    let y = me.y();

    for(let c in this.spriteContainer.children) {
      let child = this.spriteContainer.children[c];
      if (typeof child.parallax !== 'undefined') {
        child.x = (x - this.playerStartPosition[0])/5;
      }
    }

    if (x != this.lastX || y != this.lastY) {
      this.checkExits();
    }

    if (this.didExit) {
      me.rest();
      me.sprite.body.velocity.y = 0;
      return;
    }

    this.lastX = x; this.lastY = y;

    this.updateCameraOffset(x);

    if (!this.inputEnabled) {
      return;
    }

    let moveX = 0;

    let isMovingLeftOrRight = this.cursors.left.isDown || this.cursors.right.isDown;
    if (isMovingLeftOrRight) {
      me.updateVelocity(this.cursors.left.isDown);
    }
    else {
      if(!me.isDrilling)
        me.sprite.body.velocity.x = 0;
    }

    if (this.cursors.left.isDown) {
      console.log(`x = ${x}, y = ${y}`);
      // if (!this.isJumping && !this.isDashing)
      //   me.moveLeft(false);
      moveX = -0.01;
    }
    else if (this.cursors.right.isDown) {
      // if (!me.isPlayingAnimation('get-wheel') && !me.isJumping)
      //   me.moveRight();
      // if (!this.isJumping && !this.isDashing)
      //   me.moveRight(false);
      moveX = 0.01;
    }
    else if (this.cursors.up.isDown) {
      // me.sprite.body.velocity.y =
    }
    else if (this.cursors.down.isDown) {
      // this.square.moveRight();
      if (this.isDrilling)
        this.sprite.body.velocity.y = 80;
    }
    else {

    }

    if (moveX != 0) {
      if (!me.isJumping) {
        this.dust();
      }

    }
  }
}

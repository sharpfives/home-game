'use strict';

class LayeredCharacter extends Character {
  constructor(game) {
    super(game);
  }

  static configName() {
    return 'un-named character';
  }

  static loadResources(game) {

    let spriteData = game.cache.getJSON(this.configName());

    let layers = spriteData.layers;
    for (let l in layers) {
      let layer = layers[l];
      let spritesheet = layer.spritesheet;
      game.load.spritesheet(this.getLayerName(layer.name), spritesheet.filename, spritesheet.size[0], spritesheet.size[1], spritesheet.frames);
    }
  }

  breakIntoPixels() {
    return new Promise( async (resolve, reject) => {
      let promises = [];
      let particles = [];

      for(let c in this.sprite.children) {
        let layer = this.sprite.children[c];
        if (typeof layer.bmd === 'undefined')
          continue;

        // if (layer.animations.currentAnim != null )
        //   layer.animations.currentAnim.stop(false,true);

        // layer.play('')
        let totalFrameNumber = layer.animations.currentAnim.frame;
        let newSprite = this.game.make.sprite(0,0,layer.key,totalFrameNumber);
        console.log(`breaking ${layer.key} frame index ${totalFrameNumber}`);

        newSprite.scale.x = this.sprite.scale.x;
        layer.bmd.clear();
        layer.bmd.update();
        layer.bmd.draw(newSprite,newSprite.scale.x < 0 ? layer.width : 0);
        layer.bmd.dirty = true;
        layer.bmd.update();
        layer.bmd.render();

        // await sleep(5);

        let particleCount = 0;

        for(let i = 0; i < layer.width; i++) {
          for(let j = 0; j < layer.height; j++) {

            // let color = layer.bmd.getPixelRGB(i,j);
            let color = layer.bmd.getPixel(i,j);
            if (color.a !== 0) {
              particleCount++;
              let particle = this.game.add.sprite(layer.world.x + i - layer.width/2, layer.world.y + j - layer.height/2,'particle');
              this.game.physics.p2.enable(particle, DEBUG_SPRITE_POLYGONS);
              particle.body.clearShapes();

              particle.scale.x = this.sprite.scale.x;
              let hexColor = (color.r * 0x010000) + (color.g * 0x000100) + (color.b * 0x000001);
              particle.tint = hexColor;

              let vy = 7 + Math.random() * 20;
              particle.body.velocity.y = 0;

              particle.body.velocity.x = Math.random() * 40 - 20;
              let time = 500 + Math.random()*300;
              tweenPromise(this.game, particle.body.velocity, {y : vy}, time, 0, Phaser.Easing.Linear.None);
              let promise = tweenPromise(this.game, particle, {alpha : 0}, time, Math.random() * 100, Phaser.Easing.Exponential.In);
              promises.push(promise);
              particles.push(particle);
              // promise.then( () => {
              //   particle.destroy();
              // });
              // this.game.physics.p2.enable(particle, DEBUG_SPRITE_POLYGONS);
              // particle.body.clearShapes();
              // particle.body.fixedRotation = true;
              // particle.body.velocity.y = -10;
            }
          }
        }

        console.log(`layer ${layer.key} has ${particleCount} particles`);

        newSprite.destroy();

      }

      this.sprite.alpha = 0;


      Promise.all(promises).then( () => {
        console.log(`DONE ALL PARTICLES, num particles : ${particles.length}`);
        for(let p in particles) {
          particles[p].destroy();
        }
        return resolve();
      });
    });

  }

  evaporate() {
    return new Promise( async (resolve, reject) => {
      let promises = [];
      let numParticles = 0;
      for(let c in this.sprite.children) {
        let layer = this.sprite.children[c];
        if (typeof layer.bmd === 'undefined')
          continue;

        // if (layer.animations.currentAnim != null )
        //   layer.animations.currentAnim.stop(false,false);

        let animName = layer.animations.currentAnim;
        let totalFrameNumber = layer.animations.currentFrame.index;
        console.log(`evaporating ${layer.key} frame index ${totalFrameNumber}`);
        let newSprite = this.game.make.sprite(0,0,layer.key,totalFrameNumber);
        newSprite.scale.x = this.sprite.scale.x;
        // newSprite.anchor.setTo(0.5,0.5);
        // layer.bmd.clear();
        // layer.bmd.update();
        let bmd = this.game.make.bitmapData(layer.width, layer.height);
        bmd.draw(newSprite,newSprite.scale.x < 0 ? layer.width : 0);
        bmd.dirty = true;
        bmd.update();
        bmd.render();

        // await sleep(500);
        console.log(`layer size (${layer.width},${layer.height})`);

        for(let i = 0; i < layer.width; i++) {
          for(let j = 0; j < layer.height; j++) {

            let color = bmd.getPixelRGB(i,j);
            if (color.a !== 0) {
              numParticles++;
              let particle = this.game.add.sprite(layer.world.x + i - layer.width/2, layer.world.y + j - layer.height/2,'particle');
              particle.scale.x = this.sprite.scale.x;
              let hexColor = (color.r * 0x010000) + (color.g * 0x000100) + (color.b * 0x000001);
              particle.tint = hexColor;

              let promise = tweenPromise(this.game, particle, {alpha : 0, y : particle.y - layer.height}, 1800, Math.random() * 100, Phaser.Easing.Exponential.In);
              promise.then( () => {
                particle.destroy();
              });
              promises.push(promise);
              // this.game.physics.p2.enable(particle, DEBUG_SPRITE_POLYGONS);
              // particle.body.clearShapes();
              // particle.body.fixedRotation = true;
              // particle.body.velocity.y = -10;
            }
          }
        }
        newSprite.destroy();
        bmd.destroy();
      }

      this.sprite.alpha = 0;

      Promise.all(promises).then( () => {
        console.log(`done evaporating ${numParticles} particles`);
        return resolve();
      });
    });

  }

  setup(data) {
    super.setup(data);

    let playerSprite = this.game.make.sprite(6,15);
    // playerSprite.width = 30;
    // playerSprite.height = 30;
    this.game.physics.p2.enable(playerSprite, DEBUG_SPRITE_POLYGONS);
    // playerSprite.cameraOffset = [0,0]
    // playerSprite.body.collideWorldBounds = true;
    playerSprite.body.clearShapes();
    // let playerPhysicsKey = 'thimble';
    // playerSprite.body.loadPolygon('physicsData', playerPhysicsKey);
    playerSprite.body.fixedRotation = true;
    playerSprite.body.static = true;
    playerSprite.body.mass = 10000;
    playerSprite.z = 30;
    // zSortGroup.add(playerSprite);

    // let group = game.add.group();
    // group.enableBody = true;
    // group.physicsBodyType = Phaser.Physics.P2JS;

    let spriteData = this.game.cache.getJSON(this.constructor.configName());
    let layers = spriteData.layers;
    for (let i in layers) {
      let layer = layers[i];
      let layerName = this.constructor.getLayerName(layer.name);
      let layerSprite = this.game.make.sprite(0,0,layerName);
      layerSprite.character = this;
      this.game.physics.p2.enable(layerSprite, DEBUG_SPRITE_POLYGONS);
      layerSprite.body.clearShapes();
      layerSprite.type = this.constructor.configName();
      layerSprite.body.fixedRotation = true;
      // layerSprite.body.kinematic = true;
      layerSprite.body.static = true;

      let animations = layer.animations;
      for (let animationName in animations) {
        let animationObj = animations[animationName];
        let layerAnim = layerSprite.animations.add(animationName, typeof animationObj.frames === 'number' ? [animationObj.frames] : animationObj.frames, animationObj.fps, animationObj.repeat == 0 ? false : true);
        layerAnim.enableUpdate = true;
      }

      layerSprite.body.onBeginContact.add((body1,s) => {
        return;

        let otherSprite = body1.sprite;
        // console.log(`${layerSprite.key} hit ${otherSprite.key}`);
        if (typeof otherSprite.character === 'undefined') {
          console.error(`otherSprite ${otherSprite.key} does not have a character object`);
          return;
        }

        let character = otherSprite.character;
        if (this instanceof FireKing && character instanceof BigZombieStone) {
          console.log(`${layerSprite.key} hit ${otherSprite.key}`);
        }
        if (typeof this.collisionHandlers[layerName] !== 'undefined') {
          this.collisionHandlers[layerName](character);
        }
        // else if (typeof character.collisionHandlers[layerName] !== 'undefined') {
        //   character.collisionHandlers[layerName](this);
        // }
      }, this);

      playerSprite.addChild(layerSprite);
    }



    this.setSprite(playerSprite);

  }

  isLayerPlayingAnimation(layerName, animationName) {
    let currentAnim = this.layerWithKey(layerName).animations.currentAnim;
    if(currentAnim != null) {
      if (currentAnim.name === animationName && currentAnim.isPlaying) {
        return true;
      }
    }
    return false;
  }

  playAnimationOnLayers(layers,animationName) {
    let promises = [];
    for( let l in layers ) {
      let layer = layers[l];
      promises.push(this.playAnimationOnLayer(layer, animationName));
    }
    return Promise.all(promises);
  }

  playAnimationOnLayer(layer,animationName) {
    if (typeof layer.animations === 'undefined') {
      return new Promise( (resolve, reject) => {
        return resolve();
      });
    }

    if (layer.animations.currentAnim != null )
      layer.animations.currentAnim.stop(false,true);

    if (typeof layer.key !== 'string') {
      return new Promise( (resolve, reject) => {
        return resolve();
      });
    }

    let animation = layer.animations.getAnimation(animationName);
    if (animation == null) {
      layer.alpha = 0;
      layer.body.clearShapes();
      return new Promise( (resolve, reject) => {
        return resolve();
      });
    }
    else {
      layer.alpha = 1;
    }
    return new Promise( (resolve, reject) => {
      // console.log(`play animation ${animationName} on ${layer.key}`);
      animation.onComplete.addOnce((sprite, anim) => {
        // console.log(`done animation ${animationName} on ${layer.key}`);
        resolve();
      }, this);
      animation.play();
    });
  }

  playAnimation(name) {
    let promises = [];
    for(let k in this.sprite.children) {
      let layer = this.sprite.children[k];
      promises.push(this.playAnimationOnLayer(layer, name));
    }
    return Promise.all(promises);
  }

  layerWithKey(key) {
    for(let c in this.sprite.children) {
      let layer = this.sprite.children[c];
      if (layer.key === this.constructor.getLayerName(key))
        return layer;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.anchor.setTo(0.5,0.5);
    this.sprite.type = this.constructor.configName();
    // sprite.scale.x = -1;
    // sprite.body.setSize(17,17,0,17);
    sprite.smoothed = false;
    // sprite.scale.setTo(1);
    // sprite.body.allowGravity = false;
    // sprite.body.collideWorldBounds = true;
    let self = this;
    let spriteBounds = {};

    // sprite.body.addRectangle(10,10,0, 0);

    // let layer = sprite.children[""];
    // layer.body.addRectangle(10,10,0, 0);
    // return;

    for (let k in sprite.children) {
      let layer = sprite.children[k];
      let bmd1 = this.game.make.bitmapData(layer.width,layer.height);
      // bmd1.draw(layer.key,0,0);
      // bmd1.update();
      layer.bmd = bmd1;
      this.bmd = bmd1;
      let animations = layer.animations;
      spriteBounds[layer.key] = {};
      // layer.spriteBounds = sprite

      for(let name in animations._anims) {
        let animObj = animations._anims[name];

        animObj.onUpdate.add( (anim, frame) => {

          let bounds = spriteBounds[layer.key];
          if (typeof bounds[frame.index] !== 'undefined') {
            if (layer.key === 'motion') {
              console.log('');
            }
            layer.body.clearShapes();
            let b = bounds[frame.index];
            if (b.w !== 0 || b.h !== 0) {
              let r = layer.body.addRectangle(b.w, b.h, this.x()  + this.sprite.scale.x *(b.x + b.w/2 - layer.width/2), this.y() - layer.height/2 + b.y + b.h/2);
              r.sensor = true;
            }

          }
          else {
            console.log(`no bounds for ${layer.key}`);
          }
        });
        animObj.play();
        animObj.stop(false,false);
        for(let i = 0; i < animObj.frameTotal; i++) {
          animObj.setFrame(i);
          let totalFrameNumber = animObj._frames[i];
          let newSprite = this.game.make.sprite(0,0,layer.key,totalFrameNumber);
          layer.bmd.clear();
          layer.bmd.update();
          layer.bmd.draw(newSprite,0,0);
          layer.bmd.dirty = true;
          layer.bmd.update();
          layer.bmd.render();

          let minX = 99999999; let minY = 99999999;
          let maxY = -1; let maxX = -1
          for(let i = 0; i < newSprite.width; i++) {
            for(let j = 0; j < newSprite.height; j++) {
              let color = layer.bmd.getPixelRGB(i,j);
              if (color.a !== 0) {
                minX = Math.min(minX,i);
                minY = Math.min(minY,j);
                maxX = Math.max(maxX,i);
                maxY = Math.max(maxY,j);
              }
            }
          }

          // console.log(`width ${maxX - minX}`);
          if (maxX == -1 || maxY == -1) {
            spriteBounds[layer.key][totalFrameNumber] = {x : 0, y : 0, w : 0, h: 0};
          }
          else {
            spriteBounds[layer.key][totalFrameNumber] = {x : minX, y : minY, w : maxX - minX, h: maxY - minY};
          }
        }
        // setTimeout( () => {
        //   animObj.play();
        // },10);
      }
    }

  }



}

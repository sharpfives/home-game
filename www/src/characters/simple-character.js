'use strict';

class SimpleCharacter extends Character {
  constructor(game) {
    super(game);
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

  isPlayingAnimation(name) {
    let animation = this.sprite.animations.getAnimation(name);
    if (animation == null) {
      console.error(`no animation with name '${name}'`);
      return false;
    }

    return animation.isPlaying && this.sprite.animations.currentAnim.name === name;
  }

  setup(data) {
    super.setup(data);

    let spriteData = this.game.cache.getJSON(this.constructor.configName());
    let layers = spriteData.layers;


    let layer = layers[0];
    let layerName = this.constructor.getLayerName(layer.name);
    let layerSprite = this.game.make.sprite(0,0,layerName);
    layerSprite.smoothed = false;
    layerSprite.character = this;
    this.game.physics.p2.enable(layerSprite, DEBUG_SPRITE_POLYGONS);
    layerSprite.body.clearShapes();
    // layerSprite.body.fixedRotation = true;
    // swordSprite.body.static = true;
    let animations = layer.animations;
    for (let animationName in animations) {
      let animationObj = animations[animationName];
      let layerAnim = layerSprite.animations.add(animationName, typeof animationObj.frames === 'number' ? [animationObj.frames] : animationObj.frames, animationObj.fps, animationObj.repeat == 0 ? false : true);
      // layerAnim.enableUpdate = true;
    }

    layerSprite.body.addCircle(3,0,6);

    layerSprite.body.onEndContact.add((body1,s) => {
      if (body1 == null) {
        return;
      }
      let otherSprite = body1.sprite;
      if (typeof otherSprite === 'undefined' || otherSprite == null)
        return;

      if (typeof this.collisionEndHandlers[layerName] !== 'undefined') {
        this.collisionEndHandlers[layerName](otherSprite);
      }
    });

    layerSprite.body.onBeginContact.add((body1, bodyB, shapeA, shapeB, equation) => {

      if (body1 == null) {
        return;
      }

      let otherSprite = body1.sprite;

      if (typeof otherSprite === 'undefined')
        return;

      if (otherSprite == null) {
        return;
      }

      if (typeof this.collisionBeginHandlers[layerName] !== 'undefined') {
        this.collisionBeginHandlers[layerName](otherSprite);
      }

    }, this);


    this.sprite = layerSprite;

  }


}

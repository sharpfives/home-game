'use strict';

class WaterEffectOverlay extends EventEmitter {
  constructor(game, x, y, spriteName) {
    super();
    this.game = game;

    let reflection = this.game.add.sprite(x,y,spriteName);
    this.waterEffect(reflection,0,reflection.width);
    // this.waterReflection = reflection;

    // this.waterEffect(s, s.width - 100, s.width);

  }

  waterEffect(sprite,xMin,xMax) {

    let updateTime = 100;
    let bmd = this.game.add.bitmapData(sprite.width, sprite.height);

    let newSprite = this.game.make.sprite(sprite.x,sprite.y,sprite.key);

    // let newSprite = this.game.make.sprite(sprite.x,sprite.y,sprite.key,sprite.animations.currentAnim.frame);
    // let newSprite = this.game.make.sprite(0,0,sprite.key);

    bmd.clear();
    bmd.update();
    bmd.draw(newSprite,0,0);
    bmd.dirty = true;
    bmd.update();
    bmd.render();

    let phasesForRows = [];
    for (let i = 0; i < bmd.height; i++) {
      phasesForRows[i] = Math.cos(2*Math.PI*1*i/bmd.height); // + 0.5*Math.random();
    }

    let freqsForRows = [];
    for (let i = 0; i < bmd.height; i++) {
      freqsForRows[i] = 2 + 1* Math.cos(2*Math.PI*i/bmd.height);
    }

    let tempBitMap = this.game.make.bitmapData(bmd.width,bmd.height);
    // tempBitMap.ctx.clearRect(0,0,bmd.width,bmd.height);
    let tempSprite = this.game.make.sprite(sprite.world.x,sprite.world.y,tempBitMap);
    this.sprite = tempSprite;
    // tempSprite.anchor.setTo(0.5,0.5);
    newSprite.destroy();

    let index = 300;

    let lastBuffer = [];
    for(let i = 0; i < bmd.height; i++ ){
      lastBuffer[i] = [];
      for(let j = 0; j < bmd.width; j++ ){
        lastBuffer[i][j] = [0,0,0,0];
      }
    }

    let shiftRows = () => {

      newSprite = this.game.make.sprite(0,0,sprite.key);
      // let newSprite = this.game.make.sprite(0,0,sprite.key);

      bmd.clear();
      bmd.update();
      bmd.draw(newSprite,0,0);
      bmd.dirty = true;
      bmd.update();
      bmd.render();

      tempBitMap.clear();
      tempBitMap.update();

      newSprite.destroy();

      for (let j = 0; j < bmd.height; j++) {
        let shiftAmount = Math.round( 2 * Math.cos(2*Math.PI*freqsForRows[j]*index/bmd.height + phasesForRows[j]));
        for (let i = xMin; i < xMax; i++) {
          let color = bmd.getPixel(i,j);
          let r = color.r; let g = color.g; let b = color.b; let a = color.a;

          if (color.a == 0) {
          // if (color.a == 0 || this.checkPixelMask(i,j)) {
            tempBitMap.setPixel32(i, j, r, g, b, a, false);
            continue;
          }

          if (i - shiftAmount >= 0 && i - shiftAmount < bmd.width) {
            let lastPixel = lastBuffer[j][i - shiftAmount];
            tempBitMap.setPixel((i - shiftAmount), j, r, g, b, a, false);
            // tempBitMap.setPixel(i, j, r,g,b,a, false);
            // tempBitMap.setPixel((i - shiftAmount), j, Math.round((r + lastPixel[0])/2), (g + lastPixel[1])/2, (b + lastPixel[2])/2, (a + lastPixel[3])/2, false);

            lastBuffer[j][i - shiftAmount] = [r,g,b,a];
          }


          // tempBitMap.setPixel(i, j, r, g, b, color.a, false);
        }
      }
      // tempBitMap.update();
      // console.log(index);
      index++;
    };

    // shiftRows();
    this.updateTimer = setInterval( () => {
      shiftRows();
    }, updateTime);

    sprite.alpha = 0;

  }

  stop() {
    clearInterval(this.updateTimer);
  }
}

'use strict';

class GhostComic extends LayeredCharacter {
  constructor(game) {
    super(game);

    // this.setup();
  }

  static configName() {
    return 'ghost-comic';
  }

  setup(data) {
    super.setup(data);

    this.sprite.body.clearShapes();
    this.sprite.body.static = true;
    this.sprite.anchor.setTo(0,0);

    this.sprite.fixedToCamera = true;


    // this.playAnimation('rest');

  }

}

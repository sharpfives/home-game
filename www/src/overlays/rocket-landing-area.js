'use strict';

class RocketLandingCollisionArea extends SimpleCollisionArea {
  constructor(game) {
    super(game,714,126,20,20);
    this.sprite.type = 'rocket-collision-area';
  }

}

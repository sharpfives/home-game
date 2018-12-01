// const PRODUCTION_MODE = true;

const DEBUG_PHYSICS = false;
const DEBUG_SPRITE_POLYGONS = DEBUG_PHYSICS;

const DEBUG_SCENE = false;
const MODE_WHEEL = 'wheel-mode';
const MODE_NORMAL = 'normal-mode';

const AUDIO_PATH_INTRO = 'resources/sounds/music/falling-short.ogg';
const AUDIO_PATH_FIRST_SCENE = 'resources/sounds/music/ground-scene-1.ogg';
const AUDIO_PATH_SECOND_SCENE = 'resources/sounds/music/second-scene.ogg';
const AUDIO_PATH_CAVE_SCENE = 'resources/sounds/music/cave.ogg';
const AUDIO_PATH_LAST_SCENE = 'resources/sounds/music/last-scene.ogg';
const AUDIO_PATH_GOODBYE_SCENE = 'resources/sounds/music/goodbye.ogg';

const AUDIO_PATH_OCEAN_FX = 'resources/sounds/effects/ocean-fx.ogg';
const AUDIO_PATH_PIT_CLAW_FX = 'resources/sounds/effects/pit-claw-chomp.ogg';
const AUDIO_PATH_SLIME_EAT_FX = 'resources/sounds/effects/slime-monster.ogg';
const AUDIO_PATH_WHEEL_SQUEAK_FX = 'resources/sounds/effects/wheel-squeak.ogg';
const AUDIO_PATH_EXPLOSION_FX = 'resources/sounds/effects/explosion.ogg';
const AUDIO_PATH_GHOST_IN_FX = 'resources/sounds/effects/ghost1.ogg';
const AUDIO_PATH_GHOST_OUT_FX = 'resources/sounds/effects/ghost2.ogg';
const AUDIO_PATH_PULL_ROCKET_FX = 'resources/sounds/effects/pull-rocket-sound.ogg';

const AUDIO_PATH_ALIEN_POWER_UP_FX = 'resources/sounds/effects/power-up-fx.ogg';
const AUDIO_PATH_ALIEN_CRY_FX = 'resources/sounds/effects/alien-cry-fx.ogg';
const AUDIO_PATH_ALIEN_GET_WHEEL_FX = 'resources/sounds/effects/get-wheel-fx.ogg';
const AUDIO_PATH_ALIEN_LAND_FX = 'resources/sounds/effects/alien-thud-ground.ogg';
const AUDIO_PATH_ALIEN_JUMP_FX = 'resources/sounds/effects/jump-fx.ogg';
const AUDIO_PATH_ALIEN_QUESTION_IN_FX = 'resources/sounds/effects/question-in-fx.ogg';
const AUDIO_PATH_ALIEN_QUESTION_OUT_FX = 'resources/sounds/effects/question-out-fx.ogg';
const AUDIO_PATH_ALIEN_GROUND_SCOOT_FX = 'resources/sounds/effects/ground-scoot-fx.ogg';
const AUDIO_PATH_ALIEN_DRILL_START_FX = 'resources/sounds/effects/drill-start.ogg';
const AUDIO_PATH_ALIEN_DRILL_MIDDLE_FX = 'resources/sounds/effects/drill-middle.ogg';
const AUDIO_PATH_ALIEN_DRILL_END_FX = 'resources/sounds/effects/drill-end.ogg';
const AUDIO_PATH_GROUND_BREAK_FX = 'resources/sounds/effects/thud3.ogg';

const AUDIO_PATH_ORB_ACQUIRE_FX = 'resources/sounds/effects/orb-acquire.ogg';
const AUDIO_PATH_ORB_TO_ROCKET_FX = 'resources/sounds/effects/orb-to-rocket-fx.ogg';
const AUDIO_PATH_ROCKET_FIX_PART_FX = 'resources/sounds/effects/rocket-fix-part.ogg';
const AUDIO_PATH_ROCKET_LAUNCH_FX = 'resources/sounds/effects/rocket-launch-fx.ogg';
const AUDIO_PATH_ROCKET_LAND_FX = 'resources/sounds/effects/explosion.ogg';
const AUDIO_PATH_BOOST_FX = 'resources/sounds/effects/rocket-burst-fx.ogg';
const AUDIO_PATH_DASH_FX = 'resources/sounds/effects/dash-fx.ogg';

const AUDIO_PATH_BIG_ROCK_FX = 'resources/sounds/effects/big-rock.ogg';
const AUDIO_PATH_STEAM_FX = 'resources/sounds/effects/steam-fx.ogg';
const AUDIO_PATH_BIRD_WINGS_FX = 'resources/sounds/effects/bird-wings.ogg';
const AUDIO_PATH_GRASS_FX = 'resources/sounds/effects/grass.ogg';
const AUDIO_PATH_TORCH_FX = 'resources/sounds/effects/flame-ignite.ogg';
const AUDIO_PATH_RUMBLE_FX = 'resources/sounds/effects/rumble.ogg';

const STATE_START_DID_FALL_IN = 'start-fell-in';
const STATE_ORB_COLLECTED_PREFIX = 'collected-orb-';
const STATE_ORB_FOLLOWING_PREFIX = 'followed-by-orb-'
const STATE_NUM_ORBS_FOLLOWING = 'num-orbs-following';
const STATE_NUM_ORBS_IN_ROCKET = 'num-orbs-collected';
const STATE_DID_GET_WHEEL = 'did-get-wheel';
const STATE_DID_OCEAN_SCENE = 'did-ocean-scene';
const STATE_DID_ROCKET_LAND = 'did-rocket-land';
const STATE_DID_SEE_ROCKET_AREA = 'did-see-rocket-area';
const STATE_EATEN_FIRST_TIME_BY_PIT = 'did-get-eaten-first-time';
const STATE_HAS_DRILL = 'has-drill';
const STATE_HAS_BOOST = 'has-boost';
const STATE_HAS_DASH = 'has-dash';
const STATE_DONE_CAVE_TORCHES = 'done-cave-torches';

const sleep = (time) => {
  return new Promise( (resolve, reject) => {
    setTimeout( () => {
      return resolve();
    },time);
  });
};

const getFile = (url) => {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      let status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    try {
      xhr.send();
    }
    catch(e) {
      reject(e);
    }
  });
};

const getJSON = async (url, numRetries) => {
  numRetries = (typeof numRetries === 'undefined' ? 5 : numRetries);
  let retryIndex = 0;
  while (retryIndex++ < numRetries) {
    try {
      return await getFile(url);
    }
    catch(e) {
      console.log(`couldn't load ${url}, retrying`);
      await sleep(1000);
    }
  }

};

const tweenPromise = (game, item, props, time, delay, type) => {
  if (typeof type === 'undefined')
    type = Phaser.Easing.Exponential.InOut;
  if (typeof delay === 'undefined')
    delay = 0;

  return new Promise( (resolve, reject) => {
    let tween = game.add.tween(item).to( props, time, type, true, delay);
    tween.onComplete.add( ()=> {
      return resolve();
    }, this);
  });
};

const mean = (arr) => {
  let sum = 0;
  for(let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  if (arr.length == 0)
    return 0;
  else
    return sum / arr.length;
};

const animationPromise = (sprite, name) => {
  return new Promise( (resolve, reject) => {
    let animation = sprite.animations.getAnimation(name);
    if (animation == null) {
      console.log(`no animation named ${name}`);
      return resolve();
    }
    animation.onComplete.addOnce((sprite, anim) => {
      return resolve();
    }, this);
    animation.play();
  });
}

const rand = (low,high) => {
  return low + Math.random() * (high - low);
};

const linearArray = (start, stop, numElements) => {
  if (typeof numElements === 'undefined')
    numElements = Math.abs(stop - start);

  let inc = (stop - start) / (numElements);
  let arr = [];
  for (let i = 0; i < numElements + 1; i++) {
    arr.push(start + inc*i);
  }
  return arr;
};

const orbCollected = (num) => {
  return STATE_ORB_COLLECTED_PREFIX + num;
}

const orbFollowing = (num) => {
  return STATE_ORB_FOLLOWING_PREFIX + num;
}

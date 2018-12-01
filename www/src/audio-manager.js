'use strict';

class AudioManager extends EventEmitter {
  constructor() {
    super();
    this.soundMap = {};
  }

  play(path, volume, repeat) {
    volume = (typeof volume === 'undefined' ? 1 : volume);
    repeat = (typeof repeat === 'undefined' ? false : repeat);

    return new Promise( (resolve, reject) => {

      let sound = this.soundMap[path];

      if (typeof sound === 'undefined') {
        sound = new Howl({
          src: [path],
          autoplay : true,
          // preload : true,
          volume : volume,
          loop: repeat
        });
        this.soundMap[path] = sound;
      }
      else {
        if (!sound.loop() || !sound.playing()) {
          sound.volume(volume);
          sound.play();
        }
      }

      sound.once('end', () => {
        return resolve();
      });

    });
  }

  playNext(path,vol,loop) {
    return new Promise( (resolve, reject) => {
      let promises = [];
      for(let s in this.soundMap) {
        let sound = this.soundMap[s];
        if (sound.playing()) {
          let p = new Promise( (resolve1, reject1) => {
            sound.once('end', () => {
              if (sound.loop()) {
                sound.stop();
              }
              resolve1();
            });
          });
          promises.push(p);
        }
      }
      Promise.all(promises).then( async () => {
        await this.play(path,vol,loop);
        return resolve();
      })
    });


  }

  async stopAll(time) {
    for(let s in this.soundMap) {
      await this.stop(s, time);
    }
  }

  setVolume(path,vol) {
    let sound = this.soundMap[path];
    if (typeof sound !== 'undefined') {
      sound.volume(vol);
    }
  }

  stop(path, fadeTime) {
    fadeTime = (typeof fadeTime === 'undefined' ? 900 : fadeTime);
    return new Promise( (resolve, reject) => {
      let sound = this.soundMap[path];

      if (typeof sound !== 'undefined') {
        let vol = sound.volume();
        sound.fade(vol,0,fadeTime);
        sound.once('fade', () => {
          sound.stop();
          sound.volume(vol);
          return resolve();
        });
      }
      else {
        // console.error(`no sound with key ${path}`);
        return resolve();
      }
    });
  }

  pause() {
    for(let k in this.soundMap) {
      let sound = this.soundMap[k];
      if (sound.playing()) {
        sound.resumeLater = true;
        sound.pause();
      }
    }
  }

  resume() {
    for(let k in this.soundMap) {
      let sound = this.soundMap[k];
      if (sound.resumeLater) {
        sound.play();
      }
      sound.resumeLater = false;
    }
  }
}

const audioManager = new AudioManager();

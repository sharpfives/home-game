'use strict';

class InputHandler {
  constructor() {
    this.onDown = ()=>{};
    this.onUp = ()=>{};
    this.onRight = ()=>{};
    this.onLeft = ()=>{};
    this.onTap = (x,y)=>{};
    this.onDoubleTap = (x,y)=>{};
    this.onKeyDown = (key)=>{};
    this.onKeyUp = (key)=>{};

    this.keysDown = [];

  }

  setOnKey(context,cb) {
    this.onKey = (key) => {
      cb.call(context,key);
    };
  }

  isKeyDown(key) {
    return this.keysDown.includes(key);
  }

  tap(x,y) {
    this.onTap(x,y);
  }

  keyDown(key) {
    if (!this.isKeyDown(key)) {
      this.keysDown.push(key);
      this.onKeyDown(key);
    }
  }

  keyUp(key) {
    let removeKey = () => {
      let index = this.keysDown.indexOf(key);
      if (index !== -1) {
        this.keysDown.splice(index, 1);
        return true;
      }
      return false;
    };
    while(removeKey());

    this.onKeyUp(key);
  }

  doubleTap(x,y) {
    this.onDoubleTap(x,y);
  }

  left(pressed) {
    this.onLeft(pressed);
  }

  right(pressed) {
    this.onRight(pressed);
  }

  up(pressed) {
    this.onUp(pressed);
  }

  down(pressed) {
    this.onDown(pressed);
  }

}

'use strict';

class GameState extends EventEmitter {
  constructor(_name, _value) {
    super();
    this.name = _name;
    this.value = _value;
  }

  set(val) {
    this.value = val;
    this.emit('change');
  }
}

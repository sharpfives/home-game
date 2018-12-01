'use strict';

class GameStateManager extends EventEmitter {
  constructor() {
    super();
    this.states = {};
    this.conversations = {};
  }

  loadConversations(files) {
    for (let f in files) {
      getJSON(files[f]).then( (data) => {
        //console.log(data);
        this.conversations[files[f]] = data;
      });
    }
  }

  set(stateName, stateValue) {
    let state = this.states[stateName];
    if (typeof state === 'undefined') {
      state = new GameState(stateName, stateValue);
      this.addState(state);
    }

    if (typeof state.set === 'function') {
      state.set(stateValue);
    }

    // this.save();
  }

  get(stateName, defaultValue) {
    let state = this.states[stateName];
    if (typeof state !== 'undefined') {
      if (typeof state.value !== 'undefined') {
        return state.value;
      }
      else {
        this.set(stateName, defaultValue);
        return defaultValue;
      }
    }
    else {
      this.set(stateName, defaultValue);
      return defaultValue;
    }
  }

  addState(gameState) {
    this.states[gameState.name] = gameState;
    gameState.on('change',() => {
      this.emit(gameState.name,gameState.value);
    });
  }

  reset() {
    this.states = {};
    localStorage.setItem('saveData',"{}");
  }

  save() {
    let savedStr = localStorage.getItem('saveData');
    let states = JSON.parse(savedStr);
    if (states == null) {
      states = {};
    }

    for (let s in this.states) {
      states[s] = this.states[s];
    }

    // let str = JSON.stringify(this.states,null,2);
    // console.log("states to be saved:");
    // console.log(str);
    localStorage.setItem('saveData',JSON.stringify(states));
  }

  load() {
    let savedStr = localStorage.getItem('saveData');
    let states = JSON.parse(savedStr);
    for (let name in states) {
      let state = states[name];
      // for (let key in state) {
        // this.set(key,state[key]);
      let gameState = new GameState(name, state.value);
      this.addState(gameState);
      // }
    }
  }
}

const stateManager = new GameStateManager();

/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

class MicroEvent {
  constructor() {
    this._events = {};
  }
	on(event, fct){
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	}
  unbindAll() {
    this._events = {};
  }
	unbind(event, fct){
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	}
	emit(event /* , args... */){
		if( event in this._events === false  )	return;
		for(let i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}
};


// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent;
}

//= require "base"

Babylon.Parser = {};

Babylon.Parser.add = function(controller, action, func) {
  if(!this[controller]) {
    this[controller] = {};
  }

  if(!this[controller][action]) {
    this[controller][action] = func;
  }
};

Babylon.Parser.wrap = function(controller, action, stanza) {
  if(!this[controller]) {
    return stanza;
  } else if(!this[controller][action]) {
    return stanza;
  } else {
    return this[controller][action](stanza);
  }
};

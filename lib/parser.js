//= require "base"

Babylon.Parser = {};
Babylon.Parser.items = {};

Babylon.Parser.add = function(name, func) {
  this.items[name] = func;
};

Babylon.Parser.parse = function(name, stanza) {
  if(this.items[name]){
    return this.items[name](stanza);
  }
};

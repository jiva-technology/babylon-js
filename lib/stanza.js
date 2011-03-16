//= require "base"

Babylon.Stanzas = {};
Babylon.Stanzas.items = {};

Babylon.Stanzas.add = function(name, func) {
  this.items[name] = func;
};

Babylon.Stanzas.build = function(name, data) {
  return this.items[name](data);
};

//= require "base"

Babylon.Stanzas = {}; // yeah... just a container... it's cool
Babylon.Stanzas.cs = {};

Babylon.Stanzas.add = function(controller, action, func) {
  if(!this.cs[controller]) {
    this.cs[controller] = {};
  }

  if(!this.cs[controller][action]) {
    this.cs[controller][action] = func;
  }
};

Babylon.Stanzas.get = function(controller, action) {
  if(!this.cs[controller]) {
    throw "No view set for this controller: " + controller;
  } else if(!this.cs[controller][action]) {
    throw "No view set for this render action: " + action;
  } else {
    return this.cs[controller][action];
  }
};

Babylon.Stanzas.clear = function() {
   this.cs = {}; 
};

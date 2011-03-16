//= require "base"

/* This class is used as the foundation for all controller classes */
Babylon.Controller = function(){};
Babylon.prototype.name = "default";

// calls an action of the controller
Babylon.Controller.prototype.perform = function(action_name) {
  this.action_name = action_name;
  this[this.action_name]();
};

Babylon.Controller.prototype.render_and_send = function(options){
  options             = options             || {};
  options.controller  = options.controller  || this.name;
  options.action_name = options.action_name || this.action_name;
  var stanza          = Babylon.Stanzas.build(options.controller + "/" + options.action_name, options.data);
  Babylon.log.info("Sending from render_and_send");
  Babylon.Runner.connection.send(stanza);
};

Babylon.Controller.prototype.render_with_callbacks = function(options) {
  options             = options             || {};
  options.controller  = options.controller  || this.name;
  options.action_name = options.action_name || this.action_name;
  var stanza          = Babylon.Stanzas.build(options.controller + "/" + options.action_name, options.data);
  Babylon.log.info("Sending from render_with_callbacks");
  Babylon.Runner.connection.sendIQ(stanza, options);
};

//= require "base"

/* This class is used as the foundation for all controller classes */
Babylon.Controller = function(){};
Babylon.prototype.name = "default";

// calls an action of the controller
Babylon.Controller.prototype.perform = function(action_name) {
  this.action_name = action_name;
  this[this.action_name]();
  // no longer automatically rendering after a controller action
  // return this.render();
};

// DEPRECIATED render is no longer used, use render_and_send instead
Babylon.Controller.prototype.render = function(options) {
  Babylon.log.warn("DEPRECIATED Babylon.Controller.render is depreciated, use render_and_send instead");
  options = options || {};

  if(options.nothing) {
    // this hops nothing out of the short cuircuit and makes
    // for more... sensible behavior.
    this.view = function(l) { return ""; };
  }

  // This prevents repeat calling of this functions
  if(this.view && !options.force){
    return false;
  } else if(options.view) {
    this.view = options.view;
    return this.view;
  } else if(options.action) {
    return this.perform(options.action);
  } else {
    var view =  Babylon.Views.get(this.name, this.action_name);
    return this.render({"view": view});
  }
};

// DEPRECIATED evaluate is no longer used, use render_and_send instead
Babylon.Controller.prototype.evaluate = function() {
  Babylon.log.warn("DEPRECIATED Babylon.Controller.evaluate is depreciated, use render_and_send instead");
  if(this.view) {
    return this.view(this);
  } else {
    return "";
  }
};

// DEPRECIATED render_and_evaluate is no longer used, use render_and_send instead
Babylon.Controller.prototype.render_and_evaluate = function(options) {
  Babylon.log.warn("DEPRECIATED Babylon.Controller.render_and_evaluate is depreciated, use render_and_send instead");
  this.render(options);
  return this.evaluate();
};

// DEPRECIATED render_evaluate_and_send is no longer used, use render_and_send instead
Babylon.Controller.prototype.render_evaluate_and_send = function(options) {
  Babylon.log.warn("DEPRECIATED Babylon.Controller.render_evaluate_and_send is depreciated, use render_and_send instead");
  options.force = true;
  response = this.render_and_evaluate(options);
  Babylon.log.info("Sending from render_evaluate_and_send");
  Babylon.Runner.connection.send(response);
};

Babylon.Controller.prototype.render_and_send = function(options){
  options             = options             || {};
  options.controller  = options.controller  || this.name;
  options.action_name = options.action_name || this.action_name;
  var view            = Babylon.Views.get(options.controller, options.action_name);
  var stanza          = view(options.data);
  Babylon.log.info("Sending from render_and_send");
  Babylon.Runner.connection.send(stanza);
};

Babylon.Controller.prototype.render_with_callbacks = function(options) {
  options             = options             || {};
  options.controller  = options.controller  || this.name;
  options.action_name = options.action_name || this.action_name;
  var view            = Babylon.Views.get(options.controller, options.action_name);
  var stanza          = view(options.data);
  Babylon.log.info("Sending from render_with_callbacks");
  Babylon.Runner.connection.sendIQ(stanza, options);
};

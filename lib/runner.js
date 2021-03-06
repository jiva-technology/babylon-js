//= require ./base

Babylon.Runner = function(router, observer, config){
  this.router   = router;
  this.observer = observer;
  this.set_config(config);
};

Babylon.Runner.prototype.run = function(){
  Babylon.Runner.connection.attach();
};

// INFO
// not currently in use as the web app warms up the XMPP session
// for us so there is no need to login directly
Babylon.Runner.prototype.connect = function(jid, password){
  Babylon.Runner.connection.connect(jid, password);
};

Babylon.Runner.prototype.stop = function() {
  Babylon.Runner.connection.disconnect();
};

// INFO
// used for routing events
Babylon.Runner.prototype.raise = function(name, args){
  this.router.raise(name, args);
};

Babylon.Runner.prototype.connected = function() {
  return Babylon.Runner.connection.connected;
};

Babylon.Runner.prototype.set_config = function(options){
  Babylon.config.set(options);
  this.prepare();
};

Babylon.Runner.prototype.prepare = function(){
  var status_handler = new Babylon.StatusHandler(this.router, this.observer);
  Babylon.Runner.connection = new Babylon.Connection(status_handler);
};

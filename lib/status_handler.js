//= require ./base
//= require strophe

Babylon.StatusHandler = function(router, observer) {
  this.router = router;
  this.observer = observer;
};

Babylon.StatusHandler.prototype.call_on_observers = function(event, obj) {
  var that = this;

  Babylon.log.info("Calling observers of " + event);
  this.observer.call_on_observers(event, function(obs, _) {
    that.router.execute_route(obs, event, obj);
  });
};

Babylon.StatusHandler.prototype.on_status_change = function(stat, err) {
  this.call_on_observers("on_" + stat, {status: stat, error: err});
};

// this method receives all stanzas and passes them off to the router
Babylon.StatusHandler.prototype.on_stanza = function(stanza) {
  stanza = Strophe.serialize(stanza);
  this.router.route(stanza);
  return true;
};


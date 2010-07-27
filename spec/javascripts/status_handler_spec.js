describe("Babylon.StatusHandler", function() {
  var router = {};
  var observer = {};
  var handler = {};

  beforeEach(function(){
    router = {};
    router.routed_stanza = null;
    router.executed_routes = [];

    router.route = function(stanza) {
      this.routed_stanza = stanza;
    };

    router.execute_route = function(obs, event, obj) {
      this.executed_routes.push([obs, event, obj]);
    };

    observer = new Babylon.Observer();
    observer.add_connection_observer("event", "obs");

    handler = new Babylon.StatusHandler(router, observer);
  });

  describe("init", function() {
    it("should set the observer and router", function() {
      expect(handler.router).toNotEqual(null);
      expect(handler.router).toNotEqual(undefined);

      expect(handler.observer).toNotEqual(null);
      expect(handler.observer).toNotEqual(undefined);
    });
  });

  describe("call_on_observers", function() {
    it("should call observer.call_on_observers with the event and a routing function", function() {
      handler.call_on_observers("event", {status: "running"});
      expect(router.executed_routes.pop()).toEqual(["obs", "event", {status: "running"}]);
    });
  });
  
  describe("on_status_change", function() {
    it("should call observer.call_on_observers with the event and a routing function", function() {
      var mock = new Mock(handler);
      handler.expects('call_on_observers').passing("on_a_atatus", {status: "a_atatus", error: "an error"});
      handler.on_status_change("a_atatus", "an error");
    });
  });

  describe("on_stanza", function() {
    it("should call beforeEach(router.route passing in the stanza", function() {
      var s = $msg({to: 'someone', from: 'someone_else'});
      handler.on_stanza(s);
      expect(router.routed_stanza).toEqual(Strophe.serialize(s));
    });
  });
});

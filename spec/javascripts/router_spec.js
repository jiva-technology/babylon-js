describe("Babylon.Route", function() {
  var route = {};

  var controller = "test-controller";
  var action = "test-action";
  var query = 'message[from="tutor@hth.com"]';
  var stanza = $.xmlDOM('<message type="chat" to="student@hth.com" from="tutor@hth.com"><body>Hi how can I help with algebra?</body></message>');

  beforeEach(function(){
    route = new Babylon.Route(query, controller, action);
  });

  describe("init", function() {
    it("should have vars query, controller, and action set", function() {
      expect(route.query).toEqual(query);
      expect(route.controller).toEqual(controller);
      expect(route.action).toEqual(action);
    });
  });

  describe("accepts", function() {
    describe("when the query matches the stanza", function() {
      it("should return true", function(){
        expect(route.accepts(stanza)).toEqual(true);
      });
    });

    describe("when the query does not matche the stanza", function() {
      beforeEach(function(){
        stanza = $.xmlDOM('<message type="chat" to="student@hth.com" from="session_bot@htt.com"><body>I am the session bot!</body></message>');
      });
      
      it("should return false", function(){
        expect(route.accepts(stanza)).toEqual(false);
      });
    });
  });
});


describe("Babylon.Event", function() {
  var event = {};

  var event_name = 'message';
  var controller = "test-controller";
  var action = "test-action";

  beforeEach(function(){
    event = new Babylon.Event(event_name, controller, action);
  });

  describe("init", function() {
    it("should have vars name, controller and action set", function(){
      expect(event.name).toEqual(event_name);
      expect(event.controller).toEqual(controller);
      expect(event.action).toEqual(action);
    });
  });
});


describe("Babylon.Router", function() {
  var router = {};

  beforeEach(function(){
    router = new Babylon.Router();
  });

  describe("query", function() {
    
    it("should return a closure that provides .to", function() {
      var q = router.query("test-path-2");
      expect(q.to).toNotEqual(null);
      expect(q.to).toNotEqual(undefined);
    });

    describe("to", function() {
      var q = {};
      var controller = "controller";
      var action = "action";

      beforeEach(function(){
        q = router.query("test-path-3");
      });

      it("should add a Route in routes.", function() {
        q.to(controller, action);
        var r = router.routes.pop();
        expect(r.accepts).toNotEqual(null);
        expect(r.accepts).toNotEqual(undefined);
      });

      it("should return the bounding objects scope", function() {
        expect(q.query).toNotEqual(null);
        expect(q.query).toNotEqual(undefined);
      });
    });
  });

  describe("event", function() {
    var event_name = "test-event";

    it("should add the event \"name\" onto this.events", function() {
      router.event(event_name);
      expect(router.events[event_name]).toNotEqual(undefined);
      expect(router.events[event_name].length).toEqual(0);
    });

    it("should return a closure that provides .to", function() {
      var e = router.event("test-event-2");
      expect(e.to).toNotEqual(null);
      expect(e.to).toNotEqual(undefined);
    });

    describe("to", function() {
      var e = {};
      var controller = "controller";
      var action = "action";
      var event_name = "test-event-3";

      beforeEach(function(){
        e = router.event(event_name);
      });

      it("should add an Event in events.", function() {
        e.to(controller, action);
        var r = router.events[event_name].pop();
        expect(r.name).toEqual(event_name);
        expect(r.controller).toEqual(controller);
        expect(r.action).toEqual(action);
      });

      it("should return the bounding objects scope", function() {
        expect(e.event).toNotEqual(null);
        expect(e.event).toNotEqual(undefined);
      });
    });
      
  });

  describe('routing_functions', function() {
    
    var controller = {};
    var action = "test-action";
    var action_e = "test-action-e";
    var controller_name = "test-controller";
    var stanza = $msg({type: "chat", to: "student@hth.com", from: "tutor@hth.com"}).c("body").t("Hi how can I help?").toString();
    var unmatched_stanza = $pres({type: "probe", to: "student@hth.com"}).toString();
    var view_r = $msg({type: "chat"}).c("body").t("text");

    beforeEach(function(){
      controller = function(stanza){ this.stanza = stanza; this.name = controller_name; };
      controller.prototype = new Babylon.Controller();
      controller.prototype.name = controller_name;
      controller.prototype[action] = function(){};
      controller.prototype[action_e] = function(){};

      Babylon.Views.add(controller_name, action, function(l){ return view_r; });
      Babylon.Views.add(controller_name, action_e, function(l){ return ""; });

      Babylon.Runner.connection = {send: function(view) { this.view = view; }};
    });
    
    afterEach(function() {
      Babylon.Views.clear();
    });

    describe('route', function() {
      var query = 'message[from="tutor@hth.com"]';
      
      beforeEach(function(){
        router.query(query).to(controller, action);
      });

      describe("when there are matching queries", function() {
        it("should execute the route", function() {
          router.route(stanza);
          expect(Babylon.Runner.connection.view).toEqual(view_r);
        });
      });
      
      describe("where no matching queries", function() {
        it("should return false", function() {
          expect(router.route(unmatched_stanza)).toEqual(false);
        });
      });
    });

    describe('raise', function() {
      
      var event_name = "test-event";
      
      beforeEach(function(){
        router.event(event_name).to(controller, action);
      });

      it("should execute_route for each listener on \"name\" with \"args\"", function() {
        router.raise(event_name, {});
        expect(Babylon.Runner.connection.view).toEqual(view_r);
      });
    });

    describe('execute_route', function() {
      it("should call the action with the object \"stanza\" and send the view", function() {
        
        router.execute_route(controller, action, stanza);
        expect(Babylon.Runner.connection.view).toEqual(view_r);
      });

      describe("when the action evaluates to \"\"", function() {
        
        it("should  return false", function() {
          expect(router.execute_route(controller, action_e, stanza)).toEqual(false);
        });
      });
    });
  });
});

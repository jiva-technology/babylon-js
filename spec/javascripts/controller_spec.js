describe("Babylon.Controller", function() {
  var controller = {};
  var action = "";
  var name = "";

  beforeEach(function(){
    action = "test-action";
    name = "test-controller";

    controller = new Babylon.Controller();
    controller.name = name;
    controller[action] = function(){};

    Babylon.Views.add(name, action, function(){ return "default view"; });
  });

  afterEach(function() {
    Babylon.Views.clear();
  });

  describe("perform", function() {
    beforeEach(function() {
      controller = new Babylon.Controller();
      controller.name = name;
      controller[action] = function(){};
    });

    it("should set the action_name parameter", function() {
      controller.perform(action);
      expect(controller.action_name).toEqual(action);
    });

    it("should call the action specified", function() {
      controller[action] = function(){ this.perform_action_set_var = "xyz"; };
      controller.perform(action);
      expect(controller.perform_action_set_var).toEqual("xyz");
    });

    it("shouuld render the view attached to the action", function() {
      expect(controller.perform(action)()).toEqual("default view");
    });
  });

  describe("render", function() {
    beforeEach(function(){
      controller = new Babylon.Controller();
      controller.name = name;
      controller[action] = function(){};
    });

    describe("when render has been called once before", function() {
      beforeEach(function() {
        controller.render({view: true});
      });
      it("should return false", function(){
        expect(controller.render()).toEqual(false);
      });
    });

    describe("when {nothing: true} is passed in", function() {
      it("should set this.view to a callable that returns \"\"", function(){
        controller.render({nothing: true});
        expect(controller.view({})).toEqual("");
      });
    });

    describe("when {view: xxx} is passed in", function(){
      it("should set this.view to that function", function() {
        expect(controller.render({view: function(l){return "test"; }})()).toEqual("test");
      });
    });

    describe("when {action: xxx} is passed in", function(){
      beforeEach(function() {
        controller["alt-action"] = function(){};
        Babylon.Views.add(name, "alt-action", function(){ return "abcd"; });
      });

      afterEach(function() {
        Babylon.Views.clear();
      });

      it("should pass control to action xxx", function() {
        expect(controller.render({action: "alt-action"})()).toEqual("abcd");
      });
    });
  });

  describe("evaluate", function() {
    it("should return \"\" if this.view is unset", function(){
      controller.view = null;
      expect(controller.evaluate()).toEqual("");
    });

    it("should return the result of calling the view in that scope", function(){
      controller.view = function(bind){ return bind.bound_var; };
      controller.bound_var = "tada";
      expect(controller.evaluate()).toEqual("tada");
    });
  });
});

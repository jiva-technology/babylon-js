describe("Babylon.Controller", function() {
  
  var controller, xml_view_object;
  var action  = "test-action";
  var name    = "test-controller";

  beforeEach(function(){
    controller        = new Babylon.Controller();
    controller.name   = name;
    controller[action] = function(){};
    xml_view_object = xml("iq");
    Babylon.Views.add(name, action, function(){ return xml_view_object; });
  });

  afterEach(function() {
    Babylon.Views.clear();
  });

  describe("perform", function() {

    it("should set the action_name parameter", function() {
      controller.perform(action);
      expect(controller.action_name).toEqual(action);
    });

    it("should call the action specified", function() {
      controller[action] = function(){ this.perform_action_set_var = "xyz"; };
      controller.perform(action);
      expect(controller.perform_action_set_var).toEqual("xyz");
    });

    it("should render the view attached to the action", function() {
      expect(controller.perform(action)()).toEqual(xml_view_object);
    });
  }); // end describe

  describe("render", function() {

    describe("when render has been called once before", function() {
      beforeEach(function() {
        controller.render({view: true});
      });
      
      it("should return false", function(){
        expect(controller.render()).toEqual(false);
      });
    }); // end describe

    it("when {nothing: true} is passed in should set this.view to a callable that returns \"\"", function(){
      controller.render({nothing: true});
      expect(controller.view({})).toEqual("");
    });

    it("when {view: xxx} is passed in should set this.view to that function", function() {
      expect(controller.render({view: function(l){return "test"; }})()).toEqual("test");
    });

    describe("when {action: xxx} is passed in", function(){
      beforeEach(function() {
        controller["alt-action"] = function(){};
        Babylon.Views.add(name, "alt-action", function(){ return "abcd"; });
      });

      it("should pass control to action xxx", function() {
        expect(controller.render({action: "alt-action"})()).toEqual("abcd");
      });
    }); // end describe
  }); // end describe

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
  }); // end describe

  describe("render_with_callbacks", function() {
    
    beforeEach(function() {
      Babylon.Runner.connection = {};
      Babylon.Runner.connection.connection = {};
      var con_mock = new Mock(Babylon.Runner.connection.connection);
      
      controller.action_name = action;
      
      // stop auto rendering
      controller.render({ nothing: true });
    }); // end before
    
    it("should call the sendIQ method of Strophe", function() {
      // TODO this matcher should match against the xml_view_object but jsmocha is not correctly matching the objects
      Babylon.Runner.connection.connection.expects('sendIQ').passing(Match.an_object, Match.a_function, Match.a_function, 10000);
      controller.render_with_callbacks({ data: 'blah', success: function(){}, fail: function(){} });
    }); // end it
  }); // end describe
}); // end describe

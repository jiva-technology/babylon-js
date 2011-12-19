describe("Babylon.Runner", function() {

  var runner;
  var router;
  var observer;

  var host = "hth.com";
  var jid = "student@hth.com";
  var resource = "some_resource";
  var config = { "jid": jid + '/' + resource };
  var config_clone = jQuery.extend({}, config);

  beforeEach(function(){
    router = new Babylon.Router();
    observer = new Babylon.Observer();
    runner = new Babylon.Runner(router, observer, config_clone);
  });

  afterEach(function(){
    runner = undefined;
  }); // end after


  describe("init", function() {

    it("should set the observer and router", function() {
      expect(runner.router).toEqual(router);
      expect(runner.observer).toEqual(observer);
      expect(Babylon.Runner.connection).toNotBeNull();
      expect(Babylon.Runner.connection).toBeDefined();
    }); // end it
  }); // end describe


  describe("connect", function() {

    beforeEach(function(){
      var mock1 = new Mock(Babylon.Connection.prototype);
      var mock2 = new Mock(Strophe.Connection.prototype);
      Babylon.Connection.prototype.stubs("register_cookie_callback");
    });

    it("should set the config", function() {
      runner.connect(jid+'/'+resource, "password");
      expect(Babylon.config.bare_jid()).toEqual(jid);
      expect(Babylon.config.resource()).toEqual(resource);
      expect(Babylon.config.full_jid()).toEqual(jid + "/" + resource);
    }); // end it

    it("should call connect on the connection", function() {
      Strophe.Connection.prototype.expects("connect").passing(jid + '/' + resource, "password", Match.a_function);
      runner.connect(jid+'/'+resource, "password");
      expect(Strophe.Connection.prototype).verify_expectations();
    }); // end it
  }); // end describe


  describe("run", function() {

    beforeEach(function() {
      delete Babylon.Connection.cookie;
    }); // end before

    it("should call reattach when a saved session exists and attach option passed", function(){
      // TODO set mock on Strophe not babylone connection for (re)attach
      var mock = new Mock(Babylon.Connection.prototype);
      Babylon.Connection.prototype.stubs('load').returns({jid: "jid", sid: "sid", rid: "rid"});
      Babylon.Connection.prototype.expects("reattach");
      runner.set_config({"host": "hth.com", "jid": "student@hth.com", "attach": true});
      runner.run();
      expect(Babylon.Connection.prototype).verify_expectations();
    }); // end it

    it("should not call reattach when a saved session exists and attach option is not passed", function(){
      var mock = new Mock(Babylon.Connection.prototype);
      Babylon.Connection.prototype.expects("load");
      runner.run();
      expect(Babylon.Connection.prototype).verify_expectations();
    }); // end it

    it("should warm session when no saved session exists", function(){
      var mock = new Mock(jQuery);
      jQuery.expects("ajax").passing(function(args){
        var object = args[0];
        return object.type == 'POST' &&
        object.url      == '/session/warm.json' &&
        object.dataType == 'json';
      });
      runner.run();
      expect(jQuery).verify_expectations();
    }); // end it

    it("should not call reattach when a saved session does not exists and attach option passed", function(){
      var mock = new Mock(Babylon.Connection.prototype);

      Babylon.Connection.prototype.expects("load").returns(false);
      Babylon.Connection.prototype.expects("reattach").never();
      runner.set_config({"host": "hth.com", "jid": "student@hth.com"});
      runner.run();
      expect(Babylon.Connection.prototype).verify_expectations();
    }); // end it

    it("should call the strophe attach method passing the data from the saved session", function(){
      var mock1 = new Mock(Babylon.Connection.prototype);
      var mock2 = new Mock(Strophe.Connection.prototype);

      Babylon.Connection.prototype.stubs("register_cookie_callback");
      Babylon.Connection.prototype.expects("load").returns({jid: "123", sid: "456", rid: "789"});
      Strophe.Connection.prototype.expects("attach").passing(function(args){
        return args[0] == "123" && args[1] == "456" && args[2] == "789" ? true : false;
      });

      runner.set_config({ "host": "hth.com", "jid": "student@hth.com", "attach": true });
      runner.run();

      expect(Babylon.Connection.prototype).verify_expectations();
      expect(Strophe.Connection.prototype).verify_expectations();
    }); // end it
  }); // end describe
}); // end describe

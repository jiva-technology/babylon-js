Screw.Unit(function() {
  describe("Babylon.Runner", function() {
    
    var runner;
    var router;
    var observer;
    
    var host = "hth.com";
    var jid = "student@hth.com";
    var resource = "some_resource";
    var config = { "jid": jid + '/' + resource };
    var config_clone = jQuery.extend({}, config);

    before(function(){
      router = new Babylon.Router();
      observer = new Babylon.Observer();
      runner = new Babylon.Runner(router, observer, config_clone);
    });
    
    after(function() {
      delete runner;
    }); // end after


    describe("init", function() {
      
      it("should set the observer and router", function() {
        expect(runner.router).to(equal, router);
        expect(runner.observer).to(equal, observer);
        expect(Babylon.Runner.connection).to_not(be_null);
        expect(Babylon.Runner.connection).to_not(be_undefined);
      }); // end it
    }); // end describe


    describe("connect", function() {

      before(function(){
        var mock1 = new Mock(Babylon.Connection.prototype);
        var mock2 = new Mock(Strophe.Connection.prototype);
        Babylon.Connection.prototype.stubs("register_cookie_callback");
      });
      
      it("should set the config", function() {
        runner.connect(jid+'/'+resource, "password");
        expect(Babylon.config.bare_jid()).to(equal, jid);
        expect(Babylon.config.resource()).to(equal, resource);
        expect(Babylon.config.full_jid()).to(equal, jid + "/" + resource);
      }); // end it

      it("should call connect on the connection", function() {
        Strophe.Connection.prototype.expects("connect").passing(jid + '/' + resource, "password", Match.a_function);
        runner.connect(jid+'/'+resource, "password");
        expect(Strophe.Connection.prototype).to(verify_to, true);
      }); // end it
    }); // end describe
    
    
    describe("run", function() {
      
      it("should call reattach when a cookie exists and attach option passed", function(){
        // TODO set mock on Strophe not babylone connection for (re)attach
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.expects("read_cookie").returns({jid: "jid", sid: "sid", rid: "rid"});
        Babylon.Connection.prototype.expects("reattach");
        runner.set_config({"host": "hth.com", "jid": "student@hth.com", "attach": true});
        runner.run();
        expect(Babylon.Connection.prototype).to(verify_to, true);
      }); // end it
      
      it("should not call reattach when a cookie exists and attach option is not passed", function(){
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.expects("read_cookie");
        runner.run();
        expect(Babylon.Connection.prototype).to(verify_to, true);
      }); // end it
      
      it("should warm session when no cookie exists", function(){
        var mock = new Mock(jQuery);
        jQuery.stubs("cookie");
        jQuery.expects("post").passing("/session/warm.json", Match.an_object, Match.a_function, "json");
        runner.run();
        expect(jQuery).to(verify_to, true);
      }); // end it
      
      it("should not call reattach when a cookie does not exists and attach option passed", function(){
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.expects("read_cookie").returns("");
        Babylon.Connection.prototype.expects("reattach").never();
        runner.set_config({"host": "hth.com", "jid": "student@hth.com"});
        runner.run();
        expect(Babylon.Connection.prototype).to(verify_to, true);
      }); // end it
      
      it("should call the strophe attach method passing the data from the cookie", function(){
        var mock1 = new Mock(Babylon.Connection.prototype);
        var mock2 = new Mock(Strophe.Connection.prototype);
        
        Babylon.Connection.prototype.stubs("register_cookie_callback");
        Babylon.Connection.prototype.expects("read_cookie").returns({jid: "123", sid: "456", rid: "789"});
        Strophe.Connection.prototype.expects("attach").passing(function(args){
          return args[0] == "123" && args[1] == "456" && args[2] == "789" ? true : false;
        });
        
        runner.set_config({ "host": "hth.com", "jid": "student@hth.com", "attach": true });
        runner.run();
        
        expect(Babylon.Connection.prototype).to(verify_to, true);
        expect(Strophe.Connection.prototype).to(verify_to, true);
      }); // end it
    }); // end describe
  }); // end describe
});

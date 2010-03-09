Screw.Unit(function() {
  
  describe("Babylon.config", function() {
    
    before(function() {
      Babylon.config.reset();
    }); // end after
    
    describe("initial state", function() {

      it("should output an error if bare_jid is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.bare_jid() was called but Babylon.config._bare_jid is not set');
        Babylon.config.bare_jid();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if domain is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.domain() was called but Babylon.config._domain is not set');
        Babylon.config.domain();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if resource is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.resource() was called but Babylon.config._resource is not set');
        Babylon.config.resource();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if full_jid is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').twice();
        Babylon.config.full_jid();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if full_jid is called when the resource has not been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.full_jid() was called but Babylon.config._resource is not set');
        Babylon.config.set({ 'jid': 'tom@penny.com' });
        Babylon.config.full_jid();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if session_bot is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.session_bot() was called but Babylon.config._domain is not set');
        Babylon.config.session_bot();
        expect(Babylon.log).to(verify_to, true);
      }); // end it
      
      it("should output an error if pubsub is called before it's been set", function() {
        var mock = new Mock(Babylon.log);
        Babylon.log.expects('error').passing('Babylon.config.pubsub() was called but Babylon.config._domain is not set');
        Babylon.config.pubsub();
        expect(Babylon.log).to(verify_to, true);
      }); // end it

    }); // end describe
    
    
    describe("setting options", function() {
      
      it("should be able to set the attach attribute", function() {
        Babylon.config.set({ 'attach': true });
        expect(Babylon.config.attach()).to(equal, true);
      }); // end it
      
      it("should be able to set the reconnect attribute", function() {
        Babylon.config.set({ 'reconnect': true });
        expect(Babylon.config.reconnect()).to(equal, true);
      }); // end it
      
      it("should be able to set the jid", function() {
        Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
        expect(Babylon.config.bare_jid()).to(equal, 'tom@penny.com');
        expect(Babylon.config.domain()).to(equal, 'penny.com');
        expect(Babylon.config.resource()).to(equal, 'miniramp');
        expect(Babylon.config.full_jid()).to(equal, 'tom@penny.com/miniramp');
      }); // end it
      
      it("should be able to set the jid without a resource", function() {
        Babylon.config.set({ 'jid': 'tom@penny.com' });
        expect(Babylon.config.bare_jid()).to(equal, 'tom@penny.com');
        expect(Babylon.config.domain()).to(equal, 'penny.com');
        expect(Babylon.config.resource()).to(equal, null);
        expect(Babylon.config.full_jid()).to(equal, 'tom@penny.com');
      }); // end it
      
      it("should be able to set the session_bot", function() {
        Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
        Babylon.config.set({ 'session_bot': 'session@rabbitmq' });
        expect(Babylon.config.session_bot()).to(equal, 'session@rabbitmq.penny.com');
      }); // end it
      
      it("should be able to set the password", function() {
        Babylon.config.set({ 'password': 'loopylou' });
        expect(Babylon.config.password()).to(equal, 'loopylou');
      }); // end it
      
    }); // end describe
    
    
    describe("gettting options", function() {
      
      it("should be able to get attach", function() {
        expect(Babylon.config.attach()).to(equal, false);
      }); // end it
      
      it("should be able to get reconnect", function() {
        expect(Babylon.config.reconnect()).to(equal, false);
      }); // end it
      
      // bare_jid, full_jid, domain and resource already tested in "setting options"
      
      it("should be able to get host", function() {
        expect(Babylon.config.host()).to(equal, window.location.protocol + '//' + window.location.host + "/http-bind/");
      }); // end it
      
      // session_bot and password already tested in "setting options"
      
      it("should be able to get pubsub", function() {
        Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
        expect(Babylon.config.pubsub()).to(equal, 'pubsub.penny.com');
      }); // end it
      
    }); // end describe
    
    describe("resetting the class", function() {
      
      before(function() {
        // set everything
        Babylon.config.set({  'jid': 'shaun@white.com/snowboard',
                              'attach': true,
                              'reconnect': true,
                              'session_bot': 'something',
                              'password': 'blahdeblah' });
      }); // end before
      
      it("should reset everything", function() {
        Babylon.config.reset();
        expect(Babylon.config.attach()).to(equal, false);
        expect(Babylon.config.reconnect()).to(equal, false);
        expect(Babylon.config.bare_jid()).to(equal, null);
        expect(Babylon.config.domain()).to(equal, null);
        expect(Babylon.config.resource()).to(equal, null);
        expect(Babylon.config.session_bot()).to(equal, "null.null");
        expect(Babylon.config.password()).to(equal, null);
      }); // end it
      
    }); // end describe
    
  }); // end describe
  
});
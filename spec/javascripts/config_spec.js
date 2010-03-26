describe("Babylon.config", function() {
  
  beforeEach(function() {
    Babylon.config.reset();
  }); // end after
  
  describe("initial state", function() {

    it("should output an error if bare_jid is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.bare_jid() was called but Babylon.config._bare_jid is not set');
      Babylon.config.bare_jid();
    }); // end it
    
    it("should output an error if domain is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.domain() was called but Babylon.config._domain is not set');
      Babylon.config.domain();
    }); // end it
    
    it("should output an error if resource is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.resource() was called but Babylon.config._resource is not set');
      Babylon.config.resource();
    }); // end it
    
    it("should output an error if full_jid is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').twice();
      Babylon.config.full_jid();
    }); // end it
    
    it("should output an error if full_jid is called when the resource has not been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.full_jid() was called but Babylon.config._resource is not set');
      Babylon.config.set({ 'jid': 'tom@penny.com' });
      Babylon.config.full_jid();
    }); // end it
    
    it("should output an error if session_bot is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.session_bot() was called but Babylon.config._domain is not set');
      Babylon.config.session_bot();
    }); // end it
    
    it("should output an error if pubsub is called before it's been set", function() {
      var mock = new Mock(Babylon.log);
      Babylon.log.expects('error').passing('Babylon.config.pubsub() was called but Babylon.config._domain is not set');
      Babylon.config.pubsub();
    }); // end it

  }); // end describe
  
  
  describe("setting options", function() {
    
    it("should be able to set the attach attribute", function() {
      Babylon.config.set({ 'attach': true });
      expect(Babylon.config.attach()).toEqual(true);
    }); // end it
    
    it("should be able to set the reconnect attribute", function() {
      Babylon.config.set({ 'reconnect': true });
      expect(Babylon.config.reconnect()).toEqual(true);
    }); // end it
    
    it("should be able to set the jid", function() {
      Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
      expect(Babylon.config.bare_jid()).toEqual('tom@penny.com');
      expect(Babylon.config.domain()).toEqual('penny.com');
      expect(Babylon.config.resource()).toEqual('miniramp');
      expect(Babylon.config.full_jid()).toEqual('tom@penny.com/miniramp');
    }); // end it
    
    it("should be able to set the jid without a resource", function() {
      Babylon.config.set({ 'jid': 'tom@penny.com' });
      expect(Babylon.config.bare_jid()).toEqual('tom@penny.com');
      expect(Babylon.config.domain()).toEqual('penny.com');
      expect(Babylon.config.resource()).toEqual(null);
      expect(Babylon.config.full_jid()).toEqual('tom@penny.com');
    }); // end it
    
    it("should be able to set the session_bot", function() {
      Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
      Babylon.config.set({ 'session_bot': 'session@rabbitmq' });
      expect(Babylon.config.session_bot()).toEqual('session@rabbitmq.penny.com');
    }); // end it
    
    it("should be able to set the password", function() {
      Babylon.config.set({ 'password': 'loopylou' });
      expect(Babylon.config.password()).toEqual('loopylou');
    }); // end it
    
  }); // end describe
  
  
  describe("gettting options", function() {
    
    it("should be able to get attach", function() {
      expect(Babylon.config.attach()).toEqual(false);
    }); // end it
    
    it("should be able to get reconnect", function() {
      expect(Babylon.config.reconnect()).toEqual(false);
    }); // end it
    
    // bare_jid, full_jid, domain and resource already tested in "setting options"
    
    it("should be able to get host", function() {
      expect(Babylon.config.host()).toEqual(selenium_http_bind_host);
    }); // end it
    
    // session_bot and password already tested in "setting options"
    
    it("should be able to get pubsub", function() {
      Babylon.config.set({ 'jid': 'tom@penny.com/miniramp' });
      expect(Babylon.config.pubsub()).toEqual('pubsub.penny.com');
    }); // end it
    
  }); // end describe
  
  describe("resetting the class", function() {
    
    beforeEach(function() {
      // set everything
      Babylon.config.set({  'jid': 'shaun@white.com/snowboard',
                            'attach': true,
                            'reconnect': true,
                            'session_bot': 'something',
                            'password': 'blahdeblah' });
    }); // end before
    
    it("should reset everything", function() {
      Babylon.config.reset();
      expect(Babylon.config.attach()).toEqual(false);
      expect(Babylon.config.reconnect()).toEqual(false);
      expect(Babylon.config.bare_jid()).toEqual(null);
      expect(Babylon.config.domain()).toEqual(null);
      expect(Babylon.config.resource()).toEqual(null);
      expect(Babylon.config.session_bot()).toEqual("null.null");
      expect(Babylon.config.password()).toEqual(null);
    }); // end it
    
  }); // end describe
  
}); // end describe

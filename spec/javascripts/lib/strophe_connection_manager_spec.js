describe("Strophe Connection Manager", function() {
  
  it("should register the connectionManager connection plugin", function(){
    expect(Strophe._connectionPlugins.connectionManager).toBeDefined();
  });
  
  describe("when connected/attached", function() {
    
    beforeEach(function() {
      new Mock(window);
      window.expects('clearInterval');
      window.expects('setInterval').passing(Match.a_function, 10000);
    }); // end before
    
    it("should start monitoring the connection when connected", function() {
      Strophe._connectionPlugins.connectionManager.statusChanged(5);
    }); // end it
    
    it("should start monitoring the connection when attached", function() {
      Strophe._connectionPlugins.connectionManager.statusChanged(8);
    }); // end it
    
  }); // end describe
  
  describe("when disconnected", function() {
    
    beforeEach(function() {
      new Mock(window);
      window.expects('clearInterval');
      window.expects('setInterval').never();
    }); // end before
    
    it("should stop monitorring the connection", function() {
      Strophe._connectionPlugins.connectionManager.statusChanged(6);
    }); // end it
    
  }); // end describe
  
  describe("pingServer", function() {
    
    beforeEach(function() {
      var connection_mock = new Mock();
      connection_mock.donmain = 'test.local';
      connection_mock.expects('sendIQ').passing(Match.an_object, null, Match.a_function, 8000);
      Strophe._connectionPlugins.connectionManager.init(connection_mock);
    }); // end before
    
    it("should send a ping message", function() {
      Strophe._connectionPlugins.connectionManager.pingServer();
    }); // end it
    
  }); // end describe
  
  describe("when a ping request times out", function() {
    
    var connection_mock;
    
    beforeEach(function() {
      connection_mock = new Mock();
    }); // end before
    
    it("should call strophes disconnect method", function() {
      connection_mock.expects('disconnect');
      Strophe._connectionPlugins.connectionManager.init(connection_mock);
      
      Strophe._connectionPlugins.connectionManager.requestTimedOut();
    }); // end it
    
    it("should stop monitoring the connection", function() {
      new Mock(window);
      window.expects('clearInterval');
      connection_mock.stubs('disconnect');
      Strophe._connectionPlugins.connectionManager.init(connection_mock);
      
      Strophe._connectionPlugins.connectionManager.requestTimedOut();
    }); // end it
    
  }); // end describe
  
}); // end describe
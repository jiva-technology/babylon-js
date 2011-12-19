describe("Strophe Connection Manager", function() {

  var clock;

  beforeEach(function(){
    clock = sinon.useFakeTimers();
    var m = new Mock(Strophe._connectionPlugins.connectionManager);
  });

  afterEach(function(){
    clock.restore();
  });

  it("should register the connectionManager connection plugin", function(){
    expect(Strophe._connectionPlugins.connectionManager).toBeDefined();
  });

  describe("when connected/attached", function() {

    it("should start monitoring the connection when connected", function() {
      Strophe._connectionPlugins.connectionManager.expects('pingServer').times(3);

      Strophe._connectionPlugins.connectionManager.statusChanged(5);

      clock.tick(30000);
    }); // end it

    it("should start monitoring the connection when attached", function() {
      Strophe._connectionPlugins.connectionManager.expects('pingServer').times(3);

      Strophe._connectionPlugins.connectionManager.statusChanged(8);

      clock.tick(30000);
    }); // end it

  }); // end describe

  describe("when disconnected", function() {

    it("should stop monitorring the connection", function() {
      Strophe._connectionPlugins.connectionManager.expects('pingServer').never();

      Strophe._connectionPlugins.connectionManager.statusChanged(6);

      clock.tick(300000);
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
      Strophe._connectionPlugins.connectionManager.statusChanged(5);
    }); // end before

    it("should call strophes disconnect method", function() {
      connection_mock.expects('disconnect');
      Strophe._connectionPlugins.connectionManager.init(connection_mock);

      Strophe._connectionPlugins.connectionManager.requestTimedOut();
    }); // end it

    it("should stop monitoring the connection", function() {
      Strophe._connectionPlugins.connectionManager.expects('pingServer').never();

      connection_mock.stubs('disconnect');
      Strophe._connectionPlugins.connectionManager.init(connection_mock);

      Strophe._connectionPlugins.connectionManager.requestTimedOut();
      clock.tick(30000);
    }); // end it

  }); // end describe

}); // end describe

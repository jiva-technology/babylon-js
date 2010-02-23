Screw.Unit(function() {
  describe("Babylon.Connection", function() {
    
    var host = "test_host";
    var jid = "student@hth.com";
    var password = "password";
    var resource = "some_resource";
    var connection;
    var mock_handler;
    var mock_connection;
    // Strophe.Connection = MockConnection;

    before(function(){
      Babylon.config = { "host": host, "resource": resource, "domain": host };
      
      // mock strophes connection class
      mock_connection = new Mock();
      // mock_connection.stubs('connect').runs(sucessful_connection_callbacks);
      mock_connection.stubs('attach');
      mock_connection.stubs('reset');
      mock_connection.stubs('authentication_failed');
      mock_connection.stubs('connection_failed');
      mock_connection.stubs('disconnect');
      mock_connection.stubs('addHandler');
      mock_connection.stubs('send');
      
      var strophe_mock = new Mock(Strophe);
      Strophe.stubs('Connection').returns(mock_connection);
      
      // Strophe.Connection = mock_connection;
      
      mock_handler = new MockHandler();
      connection = new Babylon.Connection(host, mock_handler);
    });
    
    after(function(){
      mock_handler.reset();
      $.cookie('babylon', null);
    });


    describe("init", function() {
      it("should set the connected, host, connection, handler", function(){
        expect(connection.connected).to(equal, false);
        expect(connection.host).to(equal, host);
        expect(connection.connection).to(equal, mock_connection);
        expect(connection.handler).to(equal, mock_handler);
      });
    });


    describe("connect", function() {
      before(function(){
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.stubs("register_cookie_callback");
        mock_connection.expects('connect').passing(jid, password. Match.a_function); //.runs(sucessful_connection_callbacks);
        connection.connect(jid, password);
      });

      it("should set the Babylon.config credentials", function(){
        expect(Babylon.config.jid).to(equal, jid);
        expect(Babylon.config.password).to(equal, password);
      }); 

      it("should trigger connecting callback", function(){
        expect(mock_handler.statuses.connecting).to(equal, {status: "connecting"}); 
      });

      it("should trigger connected callback", function(){
        expect(mock_handler.statuses.connected).to(equal, {status: "connected"}); 
      });

      it("should trigger authenticating callback", function(){
        expect(mock_handler.statuses.authenticating).to(equal, {status: "authenticating"}); 
      });

      describe("when connection fails", function(){
        it("should trigger connection_failed callback", function(){
          connection.connection.connection_failed();
          expect(mock_handler.statuses.connection_failed).to(equal, {status: "connection_failed", error: "TCP Error"}); 
        });
      });

      describe("when authentication fails", function(){
        it("should trigger authentication_failed callback", function(){
          connection.connection.authentication_failed();
          expect(mock_handler.statuses.authentication_failed).to(equal, {status: "authentication_failed", error: "Bad password"}); 
        });
      });

      describe("when connection is established", function(){
        it("should send an initial presence", function(){
          expect(connection.connection.stanza.nodeName).to(equal, "presence");
        });
        it("should set connected to true", function(){
          expect(connection.connected).to(equal, true);
        });
      });
    });
      
      
    describe("using cookies to reconnect to existing session", function() {
      
      before(function(){
        Babylon.config = {};
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.stubs("register_cookie_callback");
      });
      
      it("should set the callback to write the cookie on page unload", function(){
        Babylon.Connection.prototype.expects("register_cookie_callback");
        Babylon.Connection.prototype.expects("register_for_all_messages");
        connection.on_connect(Strophe.Status.CONNECTED);
        expect(Babylon.Connection.prototype).to(verify_to, true);
      });
      
      it("should delete the cookie on disconnect", function(){
        Babylon.Connection.prototype.expects("erase_cookie");
        connection.on_connect(Strophe.Status.DISCONNECTED);
        expect(Babylon.Connection.prototype).to(verify_to, true);
      });
      
      
      describe("read_cookie", function() {
        before(function() {
          document.cookie = "babylon=a,b,c";
        });

        it("should read in the cookie and split it's contents into jid, sid and rid", function() {
          var cookie = connection.read_cookie();
          expect(cookie.jid).to(equal, "a");
          expect(cookie.sid).to(equal, "b");
          expect(cookie.rid).to(equal, "c");
        });
      });


      describe("write_cookie", function() {
        before(function() {
          connection.connect(jid, password);
          connection.connection.sid = "sid_1";
          connection.connection.rid = "rid_1";
          connection.write_cookie();
        });

        it("should write the jid, sid and rid to the cookie named \"babylon\"", function() {
          var cookie = connection.read_cookie();
          expect(cookie.jid).to(equal, jid);
          expect(cookie.sid).to(equal, "sid_1"); 
          expect(cookie.rid).to(equal, "rid_1"); 
        });
      });
    });


    describe("reattach", function() {
      // tested in runner to give a more full stack test
    });


    describe("disconnect", function() {
        
      before(function(){
        var mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.stubs("register_cookie_callback");
        connection.connect(jid, password);
        connection.disconnect();
      });

      it("should set connected to false", function(){
        expect(connection.connected).to(equal, false);
      });

      it("should delete the cookie", function(){
        Babylon.Connection.prototype.expects("erase_cookie");
        connection.on_connect(Strophe.Status.DISCONNECTED);
        expect(Babylon.Connection.prototype).to(verify_to, true);
      });

     it("should unregister the cookie callback", function(){
        Babylon.Connection.prototype.expects("unregister_cookie_callback");
        connection.on_connect(Strophe.Status.DISCONNECTED);
        expect(Babylon.Connection.prototype).to(verify_to, true);
      });

     it("should set config.reconnect to false",function (){
          expect(Babylon.config.reconnect).to(equal,false);
      });



      it("should trigger the disconnecting callback", function(){
         expect(mock_handler.statuses.disconnecting).to(equal, {status: "disconnecting"}); 
      });

      it("should trigger the disconnected callback", function(){
         expect(mock_handler.statuses.disconnected).to(equal, {status: "disconnected"}); 
      });
    }); // end describe
    
    describe("set_credentials", function() {
      
      it("should set the credentials", function() {
        connection.set_credentials('barry@some_domain.com', 'hello');
        expect(Babylon.config.jid).to(equal, 'barry@some_domain.com');
        expect(Babylon.config.full_jid).to(equal, 'barry@some_domain.com/some_resource');
        expect(Babylon.config.password).to(equal, 'hello');
      }); // end it
      
      it("should override the previously set resource", function() {
        connection.set_credentials('barry@some_domain.com/new_resource');
        expect(Babylon.config.resource).to(equal, 'new_resource');
        expect(Babylon.config.full_jid).to(equal, 'barry@some_domain.com/new_resource');
      }); // end it
      
      it("should not add a resource where this isn't one", function() {
        delete Babylon.config.resource;
        connection.set_credentials('barry@some_domain.com');
        expect(Babylon.config.resource).to(be_undefined);
        expect(Babylon.config.full_jid).to(equal, 'barry@some_domain.com');
      }); // end it
    }); // end describe
  });
});

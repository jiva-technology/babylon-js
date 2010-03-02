Screw.Unit(function() {
  describe("Babylon.Connection (new tests)", function() {
    
    var host                = 'some_host';
    var handler;
    var strophe_connection;
    var strophe_mock;
    var connection;
    var jid;
    var rid;
    var sid;
    var password;
    
    before(function() {
      Babylon.config.reset();
      handler             = new Mock();
      strophe_connection  = new Mock();
      strophe_mock        = new Mock(Strophe);
      jid                 = 'some@jid.com/some_resource';
      password            = 'a_password';
      host                = 'some_host';
      rid                 = '1234';
      sid                 = '5678';
    }); // end before
    
    describe("init", function() {
      
      before(function() {
        Strophe.expects('Connection').passing(current_http_bind_host).returns(strophe_connection);
        connection = new Babylon.Connection(handler);
      }); // end before
      
      it("should set the connected status", function() {
        expect(connection.connected).to(equal, false);
      }); // end it
      
      it("should set the handler", function() {
        expect(connection.handler).to(equal, handler);
      }); // end it
      
      it("should set the strophe connection", function() {
        expect(connection.connection).to(equal, strophe_connection);
      }); // end it
    }); // end describe
    
    
    describe("connect", function() {
      
      before(function() {
        Strophe.stubs('Connection').returns(strophe_connection);
        connection = new Babylon.Connection(host, handler);
      }); // end before
      
      it("should set the credentials", function() {
        strophe_connection.stubs('connect');
        connection.connect(jid, password);
        expect(Babylon.config.full_jid()).to(equal, jid);
      }); // end it
      
      it("should calll the strophe connection", function() {
        strophe_connection.expects('connect').passing(jid, password, Match.a_function);
        connection.connect(jid, password);
      }); // end it
    }); // end describe
    
    
    describe("attach", function() {
      
      describe("with a previous session cookie", function() {
        
        before(function() {
          Babylon.config.set({ 'attach':true });
          var jquery_mock = new Mock(jQuery);
          jQuery.stubs('cookie').returns(jid + ',' + sid + ',' + rid);
        }); // end before
        
        it("should call the reattach method of strophe", function() {
          var mock = new Mock(Strophe.Connection.prototype);
          Strophe.Connection.prototype.expects('attach').passing(jid, sid, rid, Match.a_function);
          connection = new Babylon.Connection(host, handler);
          connection.attach();
          expect(Babylon.config.full_jid()).to(equal, jid);
        }); // end it
        
      }); // end describe
      
      
      describe("without a previous session cookie", function() {
        
        before(function() {
          Babylon.config.set({ 'attach': true });
          var jquery_mock = new Mock(jQuery);
          jQuery.stubs('cookie');
        }); // end before
        
        // NOTE: not testing much here but we need to be able to run async tests to test AJAX functionality
        //       which screw unit currently doen't support
        it("should call the reattach method of strophe", function(me) {
          jQuery.expects('post').passing('/session/warm.json', Match.an_object, Match.a_function, 'json');
          connection = new Babylon.Connection(host, handler);
          connection.attach();
        }); // end it
        
      }); // end describe
      
    }); // end describe
    
    
    describe("disconnect", function() {
      
      it("description", function() {
        
      }); // end it
      
    }); // end describe
    
    
    describe("reattach", function() {
      
    }); // end describe
    
  }); // end describe
});

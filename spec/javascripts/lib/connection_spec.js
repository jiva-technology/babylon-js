/*global current_http_bind_host: false, Mooch: false */

describe("Babylon.Connection", function() {

  var handler;
  var strophe_connection;
  var strophe_mock;
  var connection;
  var jid;
  var rid;
  var sid;
  var password;

  beforeEach(function() {
    Babylon.config.reset();
    handler             = new Mock();
    strophe_connection  = new Mock();
    strophe_mock        = new Mock(Strophe);
    jid                 = 'some@jid.com/some_resource';
    password            = 'a_password';
    rid                 = '1234';
    sid                 = '5678';
  }); // end before

  describe("init", function() {

    beforeEach(function() {
      Strophe.expects('Connection').passing(current_http_bind_host).returns(strophe_connection);
      connection = new Babylon.Connection(handler);
    }); // end before

    it("should set the connected status", function() {
      expect(connection.connected).toEqual(false);
    }); // end it

    it("should set the handler", function() {
      expect(connection.handler).toEqual(handler);
    }); // end it

    it("should set the strophe connection", function() {
      expect(connection.connection).toEqual(strophe_connection);
    }); // end it

    it("should set the minimum_reconnect_time", function() {
      expect(connection.minimum_reconnect_time).toEqual(500);
    }); // end it

    it("should set the maximum_reconnect_time", function() {
      expect(connection.maximum_reconnect_time).toEqual(32000);
    }); // end it

    it("should set the current_reconnect_time", function() {
      expect(connection.current_reconnect_time).toEqual(connection.minimum_reconnect_time);
    }); // end it
  }); // end describe

  describe("connect", function() {

    beforeEach(function() {
      Strophe.stubs('Connection').returns(strophe_connection);
      connection = new Babylon.Connection(handler);
    }); // end before

    it("should set the credentials", function() {
      strophe_connection.stubs('connect');
      connection.connect(jid, password);
      expect(Babylon.config.full_jid()).toEqual(jid);
    }); // end it

    it("should calll the strophe connection", function() {
      strophe_connection.expects('connect').passing(jid, password, Match.a_function);
      connection.connect(jid, password);
    }); // end it
  }); // end describe

  describe("attach", function() {

    describe("with a previous saved session", function() {

      beforeEach(function() {
        Babylon.config.set({ 'attach':true });
        var m = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.stubs('load').returns( {jid: jid, sid: sid, rid: rid} );
      }); // end before

      it("should call the attach method of strophe", function() {
        var mock = new Mock(Strophe.Connection.prototype);
        Strophe.Connection.prototype.expects('attach').passing(jid, sid, rid, Match.a_function);
        connection = new Babylon.Connection(handler);
        connection.attach();
        expect(Babylon.config.full_jid()).toEqual(jid);
      }); // end it

    }); // end describe


    describe("without a previous saved session", function() {

      beforeEach(function() {
        Babylon.config.set({ 'attach': true });
        Mooch.init();
        handler.stubs('on_status_change');

        var m = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.stubs('load').returns( false );
        var strophe_mock = new Mock(Strophe.Connection.prototype);
      }); // end before


      afterEach(function(){
        Mooch.reset();
      });

      it("should warm and call the attach method of strophe", function() {
        runs(function(){
          Strophe.Connection.prototype.expects('attach').passing(jid, sid, rid, Match.a_function);
          Mooch.stub_request('POST', '/session/warm.json').returns({ 'body': '{ "rid": "'+rid+'", "sid": "'+sid+'", "jid": "'+jid+'" }' });
          connection = new Babylon.Connection(handler);
          connection.attach();
        });

        // we are testing asynchronous functionality so need to wait until the calls
        // have been made before allowing the suite to continue and verify the mock
        // expectations
        waits(501);
      }); // end it

    }); // end describe

  }); // end describe

  describe("warm_and_attach", function() {

    beforeEach(function() {
      handler.stubs('on_status_change');
      Mooch.init();

      var strophe_mock = new Mock(Strophe.Connection.prototype);
    }); // end before

    afterEach(function(){
      Mooch.reset();
    });

    it("should make an AJAX call to /session/warm.json and then call attach", function(){
      runs(function(){
        Strophe.Connection.prototype.expects('attach').passing(jid, sid, rid, Match.a_function);
        Mooch.stub_request('POST', '/session/warm.json').returns({ 'body': '{ "rid": "'+rid+'", "sid": "'+sid+'", "jid": "'+jid+'" }' });
        var connection = new Babylon.Connection(handler);
        connection.warm_and_attach();
      });

      // we are testing asynchronous functionality so need to wait until the calls
      // have been made before allowing the suite to continue and verify the mock
      // expectations
      waits(501);
    });

    it("should reconnect_or_destroy_session if AJAX call to /session/warm.json 500's", function(){
      runs(function(){
        var babylon_mock = new Mock(Babylon.Connection.prototype);
        Babylon.Connection.prototype.expects('reconnect_or_destroy_session');
        Mooch.stub_request('POST', '/session/warm.json').returns({ 'status': 500 });
        var connection = new Babylon.Connection(handler);
        connection.warm_and_attach();
      });

      // we are testing asynchronous functionality so need to wait until the calls
      // have been made before allowing the suite to continue and verify the mock
      // expectations
      waits(200);
    });
  });

  describe("disconnect", function() {

    beforeEach(function(){
      Mooch.init();
      Mooch.stub_request('POST', '/session/warm.json').returns({ 'body': '{ rid: "'+rid+'", sid: "'+sid+'", jid: "'+jid+'" }' });
      handler.stubs('on_status_change');
      connection = new Babylon.Connection(handler);
      connection.connect('jid@domain.com', 'pass');
    });

    afterEach(function(){
      Mooch.reset();
    });

    it("should reset the saved session", function() {
      var mock = new Mock(connection);
      connection.expects('reset').twice();

      connection.disconnect();
    }); // end it

    it("should remove the unload callback", function() {
      connection.disconnect();
      expect(window.onbeforeunload).toBeNull();
    }); // end it

    it("should set reconnect to be false", function() {
      connection.disconnect();
      expect(Babylon.config.reconnect()).toBeFalsy();
    }); // end it

    it("should set connected to false", function() {
      connection.disconnect();
      expect(connection.connected).toBeFalsy();
    }); // end it

    it("should call disconnect", function() {
      var mock = new Mock(Strophe.Connection.prototype);
      Strophe.Connection.prototype.expects('disconnect');
      connection.disconnect();
    }); // end it

  }); // end describe

  describe("reattach", function() {

    beforeEach(function() {
      Strophe.stubs('Connection').returns(strophe_connection);
      connection = new Babylon.Connection(handler);
    }); // end before

    it("should set the credentials", function() {
      strophe_connection.stubs('attach');
      connection.reattach(jid, sid, rid, true);
      expect(Babylon.config.full_jid()).toEqual(jid);
    }); // end it

    it("should call the Babylon.attach method", function() {
      strophe_connection.expects('attach').passing(jid, sid, rid, Match.a_function);
      connection.reattach(jid, sid, rid, true);
    }); // end it
  }); // end describe

  describe("load", function() {
    beforeEach(function(){
      window.sessionStorage.removeItem('babylon');
      connection = new Babylon.Connection(handler);
    });

    it("should return the credentials using sessionStorage", function(){
      var credentials = {jid: jid, sid: sid, rid: rid};
      window.sessionStorage.setItem('babylon', JSON.stringify(credentials));

      expect( connection.load() ).toEqual( credentials );
    });

    it("should return false if there are no credentials found", function(){
      expect( connection.load() ).toBeFalsy();
    });
  });

  describe("save", function() {
    beforeEach(function(){
      var m1 = new Mock(Babylon.config);
      Babylon.config.stubs('full_jid').returns( "foo@bar/blah" );

      connection = new Babylon.Connection(handler);
      connection.connection = {sid: 123, rid: 456};
    });

    it("should save the credentials using sessionStorage", function(){
      window.sessionStorage.removeItem('babylon');

      connection.save();

      expect( connection.load() ).toEqual({jid: 'foo@bar/blah', sid: 123, rid: 456});
    });
  });

  describe("on_attached", function() {

    beforeEach(function(){
      handler.on_status_change = function(){};
      connection = new Babylon.Connection(handler);
      var conn_mock = new Mock(connection);
    });

    it("should run register_unload_callback", function(){
      connection.expects('register_unload_callback');

      connection.on_attached();
    });

  });

  describe("register_unload_callback", function() {

    beforeEach(function(){
      connection = new Babylon.Connection(handler);
      var c = new Mock(connection);
      var m = new Mock(MockConnection.prototype);
      var j = new Mock(jQuery.prototype);

      MockConnection.prototype.stubs('pause');
    });

    it("should run 'save' when window is unloaded", function(){
      jQuery.prototype.stubs('unload').passing(function(params){ params[0](); });

      connection.expects('save');

      connection.register_unload_callback();
    });

    it("should run 'pause' when window is unloaded", function(){
      jQuery.prototype.stubs('unload').passing(function(params){ params[0](); });

      MockConnection.prototype.expects('pause');

      connection.register_unload_callback();
    });

    it("should bind to window unload using jquery", function(){
      // This is important as window.onbeforeunload behaves differently in IE8
      // For example clicking <a href='javascript:;'>Foo</a> will fire onbeforeunload
      jQuery.prototype.expects('unload').passing(Match.a_function);

      connection.register_unload_callback();
    });

  });

  describe("reset", function() {
    beforeEach(function(){
      connection = new Babylon.Connection(handler);
    });

    it("should clear any saved credentials in sessionStorage", function(){
      window.sessionStorage.setItem('babylon', "foo");

      expect( window.sessionStorage.getItem('babylon') !== null ).toBeTruthy();

      connection.reset();

      expect( window.sessionStorage.getItem('babylon') === null ).toBeTruthy();
    });
  });

  describe("on connect handler", function() {

    beforeEach(function() {
      // Can't use jsmocha here as the teardown causes the stub to be destroyed
      // before all of the code has been run in IE8
      handler.on_status_change = function(){};
      connection = new Babylon.Connection(handler);
    }); // end before

    describe("attached event", function() {

      beforeEach(function() {
        var conn_mock = new Mock(connection);
      }); // end before

      describe("when not warming", function() {

        beforeEach(function() {
          connection.is_warming = false;
        }); // end before

        it("should call on_attached immediately", function() {
          connection.expects('on_attached');
          connection.on_connect(Strophe.Status.ATTACHED, "", true);
        }); // end it

      }); // end describe

      describe("when warming", function() {

        beforeEach(function() {
          connection.is_warming = true;
        }); // end before

        it("should wait for 500ms then send a precence message and call on_attached", function() {
          runs(function(){
            connection.expects('send_presence');
            connection.expects('on_attached');
            connection.on_connect(Strophe.Status.ATTACHED, "", true);
          });
          waits(501);
        }); // end it

        it("should not send a precence message and call on_attached before 500ms has expired", function() {
          runs(function(){
            connection.expects('send_presence').never();
            connection.expects('on_attached').never();
            connection.on_connect(Strophe.Status.ATTACHED, "", true);
          });
          waits(400);
        }); // end it

      }); // end describe

    }); // end describe

  }); // end describe

}); // end describe

//= require "base"
//= require <strophe>
//= require <jquery>

/* Connection is a class that happily wraps strophe up */
Babylon.Connection = function(handler) {
  this.connected              = false;
  this.handler                = handler;
  this.minimum_reconnect_time = 500; // ms to wait for first retry attempt - doubled for every failure
  this.maximum_reconnect_time = 32000;
  this.current_reconnect_time = this.minimum_reconnect_time;
  this.connection             = new Strophe.Connection(Babylon.config.host());
  this.connection.rawInput    = this.rawInput;
  this.connection.rawOutput   = this.rawOutput;
  this.message_handler        = null;
  this.is_warming             = false;
};

Babylon.Connection.prototype.rawInput = function(data) {
  Babylon.log.info('Babylon received: ' + data);
};

Babylon.Connection.prototype.rawOutput = function(data) {
  Babylon.log.info('Babylon sent: ' + data);
};

Babylon.Connection.prototype.connect = function(jid, password) {
  this.set_credentials(jid, password);
  var that = this;
  this.connection.connect(Babylon.config.full_jid(), password, function(s,e){ that.on_connect(s,e); });
};

Babylon.Connection.prototype.attach = function() {
  var settings = this.load();
  if(settings){
    this.reattach(settings.jid, settings.sid, settings.rid);
  }else{
    this.warm_and_attach();
  }
};

Babylon.Connection.prototype.disconnect = function() {
  this.reset();
  this.unregister_unload_callback();
  Babylon.config.set({ 'reconnect': false });
  this.connection.disconnect();
  // force strophe to send the message immediatly
  this.connection.flush();
  this.connected = false;
};

Babylon.Connection.prototype.warm_and_attach = function() {
  var that = this;
  this.handler.on_status_change("warming");
  // TODO: add the warm url to the config options
  $.ajax({
    type:     'POST',
    url:      '/session/warm.json',
    data:     {},
    success:  function(data) {
                that.is_warming = true;
                Babylon.log.info("Successfully warmed session, sid:" + data.sid + ", rid:" + data.rid + " for " + data.jid);
                that.reattach( data.jid, data.sid, data.rid, true );
              },
    error:    function(request, textStatus, errorThrown){
                Babylon.log.error(["Failed to warm session: " + textStatus, request, errorThrown]);
                that.reconnect_or_destroy_session();
              },
    dataType: 'json'
  });
};

// This function reattaches to a previous connection on the server
// can be used for persisting the object accross page loads
Babylon.Connection.prototype.reattach = function(jid, sid, rid, send_presence) {
  this.set_credentials(jid);
  var that = this;
  this.connection.attach(jid, sid, rid, function(s,e){ that.on_connect(s, e, send_presence); });
};

Babylon.Connection.prototype.reconnect_or_destroy_session = function() {
  this.reset();
  var that = this;
  if(Babylon.config.reconnect()){
    Babylon.log.info("Scheduling reconnect in " + this.current_reconnect_time + "ms" );
    
    setTimeout(function(){
      Babylon.log.info("Attempting reconnect");
      var next_timeout = that.current_reconnect_time * 2;
      if( next_timeout <= that.maximum_reconnect_time ){
        that.current_reconnect_time = next_timeout;
      }
      if( Babylon.config.attach() ){
        that.warm_and_attach();
      } 
      else if( Babylon.config.password() ){
        that.connect( Babylon.config.full_jid(), Babylon.config.password() );
      }
    }, this.current_reconnect_time );
    
  } else {
    this.unregister_unload_callback();
  }
};

// write jid, sid, rid and expires to cookie
Babylon.Connection.prototype.save = function() {
  var jid = Babylon.config.full_jid();
  var sid = this.connection.sid;
  var rid = this.connection.rid;
  
  console.log(this.connection);
  console.log(this.connection.sid);
  console.log(this.connection.rid);
  
  if(window.sessionStorage && jid !== "" && sid !== "" && rid !== ""){
    window.sessionStorage.setItem('babylon', JSON.stringify( { jid: jid, sid: sid, rid: rid } ) );
  }
};

// read jid, sid, rid and expires from cookie
Babylon.Connection.prototype.load = function(expires) {
  var item;
  if (window.sessionStorage && (item = window.sessionStorage.getItem('babylon')) ) {
    if(typeof item.value == 'undefined'){
      return JSON.parse( item );
    } else {
      return JSON.parse( item.value );
    }
  } else {
    return false;
  }
};

// erase the cookie
Babylon.Connection.prototype.reset = function() {
  if ( window.sessionStorage ){
    window.sessionStorage.removeItem('babylon');
  }
};

Babylon.Connection.prototype.register_unload_callback = function() {
  var that = this;
  // save the connection jid, rid and sid when the page is unloaded so that we can reattach
  window.onbeforeunload = function(){
    that.connection.pause();
    that.save();
  };
};

Babylon.Connection.prototype.connecting_for_the_first_time = function() {
  return this.load() === false;
};

Babylon.Connection.prototype.unregister_unload_callback = function() {
  window.onbeforeunload = null;
};

Babylon.Connection.prototype.set_credentials = function(jid, password) {
  Babylon.config.set({ 'jid': jid });
  if(password){
    Babylon.config.set({ 'password': password });
  }
};

/* There are 5 connection statuses, this directs controll to functions
 * that handle them.
 *
 * But this in turn is really a wrapper around the handler passed to
 * the Connection object on initialization. If you follow most of these
 * paths, you'll find the same function called on the handler.*/
Babylon.Connection.prototype.on_connect = function(status, err, send_presence) {
  switch(status) {
    case Strophe.Status.ERROR:
      Babylon.log.info("status: error, " + err);
      this.reset();
      this.unregister_unload_callback();
      this.on_error(err);
      break;

    case Strophe.Status.AUTHENTICATING:
      Babylon.log.info("status: authenticating");
      this.handler.on_status_change("authenticating");
      break;

    case Strophe.Status.AUTHFAIL:
      Babylon.log.info("status: authentication_failed, " + err);
      this.reset();
      this.unregister_unload_callback();
      this.handler.on_status_change("authentication_failed", err);
      break;

    case Strophe.Status.DISCONNECTING:
      Babylon.log.info("status: disconnecting");
      this.handler.on_status_change("disconnecting");
      break;

    case Strophe.Status.DISCONNECTED:
      Babylon.log.info("status: disconnected");
      this.reconnect_or_destroy_session();
      this.handler.on_status_change("disconnected");
      break;

    case Strophe.Status.CONNECTING:
      Babylon.log.info("status: connecting");
      this.handler.on_status_change("connecting");
      break;

    case Strophe.Status.CONNFAIL:
      Babylon.log.error("status: connection_failed, " + err);
      this.reset();
      this.unregister_unload_callback();
      this.handler.on_status_change("connection_failed", err);
      break;

    case Strophe.Status.CONNECTED:
      Babylon.log.info("status: connected");
      this.register_unload_callback();
      this.register_for_all_messages();
      this.connection.send($pres({ from: Babylon.config.full_jid() }).tree());
      this.handler.on_status_change("connected");
      this.current_reconnect_time = this.minimum_reconnect_time;
      this.connected = true;
      break;
    
    case Strophe.Status.ATTACHED:
      // Strophe fires the attached event before the first blank message has been sent
      // this causes jabber to ignore messages sent that are triggered by the attached
      // callback as they are sent before the first blank message.
      // SOLUTION:
      // wait got 500ms then call the attached event again
      var that = this;
      
      if(this.is_warming){
        Babylon.log.info("connection warming so waiting for 500ms before proceeding");
        setTimeout(function(){
          if(send_presence){
            that.send_presence();
          }
          that.on_attached();
        }, 500);
      }else{
        this.on_attached();
      }
      this.is_warming = false;
      break;
    }
};

Babylon.Connection.prototype.on_attached = function() {
  Babylon.log.info("status: attached");
  this.register_unload_callback();
  this.register_for_all_messages();
  this.handler.on_status_change("attached");
  this.current_reconnect_time = this.minimum_reconnect_time;
  this.connected = true;
};

Babylon.Connection.prototype.register_for_all_messages = function() {
  var that = this;
  // Remove old message handler
  this.connection.deleteHandler(this.message_handler);
  // We want to receive ALL stanzas from strophe, un filtered
  this.message_handler = this.connection.addHandler(function(s) { return that.handler.on_stanza(s); }, null, null, null, null,  null);
};

Babylon.Connection.prototype.send_presence = function(){
  this.send($pres().tree());
};

Babylon.Connection.prototype.send = function(stanza) {
  this.connection.send(stanza);
};

Babylon.Connection.prototype.sendIQ = function(stanza, options) {
  this.connection.sendIQ(stanza, options.success, options.fail, Babylon.config.request_timeout());
};

Babylon.Connection.on_status_change = function(status, err) {
  this.handler.on_status_change(status, err);
};

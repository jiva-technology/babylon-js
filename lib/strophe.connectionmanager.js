//= require <strophe>

Strophe.addConnectionPlugin('connectionManager', {
  
  pingTime:      10000, // the time in ms between each ping
  timeoutTime:   8000,  // the time in ms to wait for a ping to return
  pingInterval:  null,
  connection:    null,
  
  init: function(connection) {
    this.connection = connection;
  },

  // Called automatically by Strophe when the connection status changes
  statusChanged: function(status){
    switch(status) {
      case Strophe.Status.CONNECTED:
      case Strophe.Status.ATTACHED:
        this.monitorConnection();
        break;
      case Strophe.Status.DISCONNECTED:
        this.stopMonitoring();
        break;
    }
  },
  
  monitorConnection: function(){
    var self = this;
    clearInterval(this.pingInterval);
    this.pingInterval = setInterval(function(){ self.pingServer(); }, this.pingTime);
  },
  
  stopMonitoring: function(){
    clearInterval(this.pingInterval);
  },
  
  pingServer: function(){
    var self = this;
    var stanza = $iq({
      id:   "ping",
      type: "get",
      to:   this.connection.domain
    }).c("ping", {xmlns: 'urn:xmpp:ping'});
    
    this.connection.sendIQ(stanza, null, function(){ self.requestTimedOut(); }, this.timeoutTime);
  },
  
  requestTimedOut: function(){
    this.stopMonitoring();
    this.connection.disconnect();
  }
});

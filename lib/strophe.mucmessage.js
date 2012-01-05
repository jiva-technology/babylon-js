//= require strophe

Strophe.addConnectionPlugin('mucMessage', {
  
  messages: {},
  
  init: function(connection) {
    this.connection = connection;
  },
  
  // Called automatically by Strophe when the connection status changes
  statusChanged: function(status){
    if(status == Strophe.Status.DISCONNECTED) {
      // call all of the error backs for messages that are in the sending state when disconnected
      this.callErrBacks();
    }
  },
  
  send: function(elem, errback, timeout) {
    var timeoutHandler  = null;
    var self            = this;
    var errbackArgs     = Array.prototype.slice.call(arguments).slice(3); // store any extra arguments to pass to the errback

    if (typeof(elem.tree) === "function") {
      elem = elem.tree();
    }
    var id = elem.getAttribute('id');

    // inject id if not found
    if (!id) {
      id = self.connection.getUniqueId("message");
      elem.setAttribute("id", id);
    }
    
    // add the id to the array of arguments we send to the errback
    errbackArgs.unshift(id);

    var handler = self.connection.addHandler(function (stanza) {
      // remove timeout handler when we receive the message back
      self.connection.deleteTimedHandler(timeoutHandler);
      
      // remove the message from the store
      delete self.messages[id];
    }, null, 'message', null, id);

    // setup timeout handler.
    timeoutHandler = self.connection.addTimedHandler(timeout, function () {
      // get rid of normal handler
      self.connection.deleteHandler(handler);
      
      // remove the message from the store
      delete self.messages[id];

      // call errback on timeout with null stanza
      errback.apply(this, errbackArgs);
      return false;
    });
    
    // add the message to the store
    self.messages[id] = { errback: errback, errbackArgs: errbackArgs };

    self.connection.send(elem);

    return id;
  },
  
  callErrBacks: function(){
    for (var key in this.messages) {
      if (this.messages.hasOwnProperty(key)) {
        this.messages[key].errback.apply(this, this.messages[key].errbackArgs);
      }
    }
    this.messages = {};
  }
});
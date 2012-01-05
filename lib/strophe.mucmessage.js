//= require strophe

Strophe.addConnectionPlugin('mucMessage', {
  
  init: function(connection) {
    this.connection = connection;
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
    }, null, 'message', null, id);

    // setup timeout handler.
    timeoutHandler = self.connection.addTimedHandler(timeout, function () {
      // get rid of normal handler
      self.connection.deleteHandler(handler);

      // call errback on timeout with null stanza
      errback.apply(this, errbackArgs);
      return false;
    });

    self.connection.send(elem);

    return id;
  }
});
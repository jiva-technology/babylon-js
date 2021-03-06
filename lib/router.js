//= require ./base
//= require jquery
//= require jquery.xmldom

/* The Route class simply stores the relationship between the query,
 * the controller and the action, and provides a method to access
 * that relationship.
 */
Babylon.Route = function(query, controller, action) {
  this.query      = query;
  this.controller = controller;
  this.action     = action;
};

Babylon.Route.prototype.accepts = function(stanza) {
  return stanza.find(this.query).length > 0;
};

/* The Event class is used to push data to actions when not arriving from
 * external sources.
 */

Babylon.Event = function(name, controller, action){
  this.name       = name;
  this.controller = controller;
  this.action     = action;
};



/* The Router class builds routes, and executes them. Taking the provided * stanza to the controller and calling the action on it.
 */
Babylon.Router = function() {
  this.events   = {};
  this.queries  = [];
  this.routes   = [];
};

/* Both query and event follow a kind of tricky pattern. In that this is a
 * function that returns an object, that provides the .to function.
 * And that to function, captures within it, the reference to query, and
 * our original router object. Thus allowing us to create routes. */
Babylon.Router.prototype.query = function(path) {
  var that = this;

  that.to = function(controller, action) {
    var route = new Babylon.Route(path, controller, action);
    that.routes.push(route);
    return that;
  };
  return that;
};

/* See .query for an explanation of what's happening */
Babylon.Router.prototype.event = function(name) {
  var that = this;
  this.events[name] = [];

  that.to = function(controller, action) {
    var event = new Babylon.Event(name, controller, action);
    that.events[name].push(event);
    return that;
  };
  return that;
};

/* This is simple a closure around the func object such that
 * we can passin our little DSL
 */
Babylon.Router.prototype.draw = function(func) {
  func(this);
};

/* Takes a stanza, does a JQuery match against it to find a controller / action
 * pair, then intializes the controller and calls the action.
 */
Babylon.Router.prototype.route = function(stanza) {
  // convert the stanza to a jquery xml document
  stanza = $.xmlDOM(stanza);

  var self = this;

  // find the first route that matchs the stanza
  var routes = $.each(this.routes, function(i, route){
    if(route.accepts(stanza)){
      Babylon.log.info("routing from query: " + route.query + " to: " + route.controller.prototype.name + ", " + route.action);
      self.execute_route(route.controller, route.action, stanza);
      return false;
    }
  });
};

/* This is the event analog of "route" maybe one day these two interfaces
 * will be united
 */
Babylon.Router.prototype.raise = function(name, args) {
  var events = this.events[name];
  if(events && events.length > 0) {
    var ev_len = events.length;
    for (var i = 0; i < ev_len; i++) {
      var e = events[i];
      Babylon.log.info("routing from event: " + name + " to : " + e.controller.prototype.name + ", " + e.action);
      this.execute_route(e.controller, e.action, args);
    }
  }
};

/* A Helper function for working with the controller */
Babylon.Router.prototype.execute_route = function(controller, action, stanza) {
  var s = Babylon.Parser.parse(controller.prototype.name + "/" + action, stanza);
  var c = new controller(s);
  c.perform(action);
  return false;
};

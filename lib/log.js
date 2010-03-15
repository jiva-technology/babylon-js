Babylon.log = function(){};

// The logger object is meant to be easily overwritten
Babylon.log = {};

// Don't preface every message with a string as it typecasts objects 
// to strings and stops them being inspected in the console.

Babylon.log.debug = function(msg) { 
  if (typeof(console) != "undefined" && console.debug) {
    console.debug(msg); 
  }
};
Babylon.log.info = function(msg) {
  if (typeof(console) != "undefined" && console.info) {
    console.info(msg); 
  }
};
Babylon.log.warn = function(msg) { 
  if (typeof(console) != "undefined" && console.warn) {
    console.warn(msg); 
  }
};
Babylon.log.error = function(msg) { 
  if (typeof(console) != "undefined" && console.error) {
    console.error(msg); 
  }
};


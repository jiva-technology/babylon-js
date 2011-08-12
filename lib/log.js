//= require ./base
//= require jquery
//= require jquery.hth_log

Babylon.log = function(){};

// The logger object is meant to be easily overwritten
Babylon.log = {};

// Don't preface every message with a string as it typecasts objects 
// to strings and stops them being inspected in the console.

Babylon.log.debug = function(msg) { 
  $.hth_log.debug(msg); 
};
Babylon.log.info = function(msg) {
  $.hth_log.info(msg); 
};
Babylon.log.warn = function(msg) { 
  $.hth_log.warn(msg); 
};
Babylon.log.error = function(msg) { 
  $.hth_log.error(msg); 
};


Babylon.log = function(){};

// The logger object is meant to be easily overwritten
Babylon.log = {};

// Don't preface every message with a string as it typecasts objects 
// to strings and stops them being inspected in the console.

Babylon.log.debug = function(msg) { 
  if (typeof(HTH) != "undefined") {
    HTH.Log.debug(msg); 
  }else{
    console.debug(msg);
  }
};
Babylon.log.info = function(msg) {
  if (typeof(HTH) != "undefined") {
    HTH.Log.info(msg); 
  }else{
    console.info(msg);
  }
};
Babylon.log.warn = function(msg) { 
  if (typeof(HTH) != "undefined") {
    HTH.Log.warn(msg); 
  }else{
    console.warn(msg);
  }
};
Babylon.log.error = function(msg) { 
  if (typeof(HTH) != "undefined") {
    HTH.Log.error(msg); 
  }else{
    console.error(msg);
  }
};


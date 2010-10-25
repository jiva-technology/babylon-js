Babylon.config = {
  
  _settable_attributes: ['attach', 'reconnect', 'jid', 'session_bot', 'password'],
  
  // setup the options
  _options: {
    _attach:          false,
    _reconnect:       false,
    _bare_jid:        null,
    _domain:          null,
    _resource:        null,
    _path:            "/http-bind/",
    _session_bot:     null,
    _password:        null
  },
  
  request_timeout: function(){
    return 10000;
  },
  
  attach: function(){
    return Babylon.config._options._attach;
  },
  
  reconnect: function(){
    return Babylon.config._options._reconnect;
  },
  
  bare_jid: function(){
    Babylon.config.log_error_if_blank("bare_jid", ['_bare_jid']);
    return Babylon.config._options._bare_jid;
  },
  
  username: function(){
    Babylon.config.log_error_if_blank("bare_jid", ['_bare_jid']);
    return Strophe.getNodeFromJid(Babylon.config._options._bare_jid);
  },
  
  domain: function(){
    Babylon.config.log_error_if_blank("domain", ['_domain']);
    return Babylon.config._options._domain;
  },
  
  resource: function(){
    Babylon.config.log_error_if_blank("resource", ['_resource']);
    return Babylon.config._options._resource;
  },
  
  full_jid: function(){
    Babylon.config.log_error_if_blank("full_jid", ['_bare_jid', '_resource']);
    return [Babylon.config._options._bare_jid, Babylon.config._options._resource].filter(function(v){return v !== null;}).join("/");
  },
  
  host: function(){
    return window.location.protocol + '//' + window.location.host + Babylon.config._options._path;
  },
  
  session_bot: function(){
    Babylon.config.log_error_if_blank("session_bot", ['_domain']);
    return Babylon.config._options._session_bot + '.' + Babylon.config._options._domain;
  },
  
  pubsub: function(){
    Babylon.config.log_error_if_blank("pubsub", ['_domain']);
    return 'pubsub.' + Babylon.config._options._domain;
  },
  
  password: function(){
    return Babylon.config._options._password;
  },
  
  set: function(options){
    for(var key in options) {
      if($.inArray(key, Babylon.config._settable_attributes) > -1){
        if(key == "jid"){
          Babylon.config.set_jid(options[key]);
        }else{
          Babylon.config._options["_" + key] = options[key];
        }
      }
    }
  },

  set_jid: function(jid){
    Babylon.config._options._domain    = Strophe.getDomainFromJid(jid);
    Babylon.config._options._resource  = Strophe.getResourceFromJid(jid);
    Babylon.config._options._bare_jid  = Strophe.getBareJidFromJid(jid);
  },
  
  log_error_if_blank: function(method, attrs){
    $.each(attrs, function(i,v){
      if(Babylon.config._options[v] === null){
        Babylon.log.error("Babylon.config."+method+"() was called but Babylon.config."+v+" is not set");
      }
    });
  },
  
  reset: function(){
    Babylon.config._options._attach        = false;
    Babylon.config._options._reconnect     = false;
    Babylon.config._options._bare_jid      = null;
    Babylon.config._options._domain        = null;
    Babylon.config._options._resource      = null;
    Babylon.config._options._session_bot   = null;
    Babylon.config._options._password      = null;
  }
};
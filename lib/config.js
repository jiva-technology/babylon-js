Babylon.config = {
  
  _settable_attributes: ['attach', 'reconnect', 'jid', 'session_bot', 'password'],
  
  // setup the options
  _attach:      false,
  _reconnect:   false,
  _bare_jid:    null,
  _domain:      null,
  _resource:    null,
  _host:        window.location.protocol + '//' + window.location.host + "/http-bind/",
  _session_bot: null,
  _password:    null, 
  
  attach: function(){
    return Babylon.config._attach;
  },
  
  reconnect: function(){
    return Babylon.config._reconnect;
  },
  
  bare_jid: function(){
    Babylon.config.log_error_if_blank("bare_jid", ['_bare_jid']);
    return Babylon.config._bare_jid;
  },
  
  domain: function(){
    Babylon.config.log_error_if_blank("domain", ['_domain']);
    return Babylon.config._domain;
  },
  
  resource: function(){
    Babylon.config.log_error_if_blank("resource", ['_resource']);
    return Babylon.config._resource;
  },
  
  full_jid: function(){
    Babylon.config.log_error_if_blank("full_jid", ['_bare_jid', '_resource']);
    return [Babylon.config._bare_jid, Babylon.config._resource].filter(function(v){return v !== null;}).join("/");
  },
  
  host: function(){
    return Babylon.config._host;
  },
  
  session_bot: function(){
    Babylon.config.log_error_if_blank("session_bot", ['_domain']);
    return Babylon.config._session_bot + '.' + Babylon.config._domain;
  },
  
  pubsub: function(){
    Babylon.config.log_error_if_blank("pubsub", ['_domain']);
    return 'pubsub.' + Babylon.config._domain;
  },
  
  password: function(){
    Babylon.config.log_error_if_blank("password", ['_password']);
    return Babylon.config._password;
  },
  
  set: function(options){
    for(var key in options) {
      if($.inArray(key, Babylon.config._settable_attributes) > -1){
        if(key == "jid"){
          Babylon.config.set_jid(options[key]);
        }else{
          Babylon.config["_" + key] = options[key];
        }
      }
    }
  },
  
  set_jid: function(jid){
    Babylon.config._domain    = Strophe.getDomainFromJid(jid);
    Babylon.config._resource  = Strophe.getResourceFromJid(jid);
    Babylon.config._bare_jid  = Strophe.getBareJidFromJid(jid);
  },
  
  log_error_if_blank: function(method, attrs){
    $.each(attrs, function(i,v){
      if(Babylon.config[v] === null){
        Babylon.log.error("Babylon.config."+method+"() was called but Babylon.config."+v+" is not set");
      }
    });
  },
  
  reset: function(){
    Babylon.config._attach        = false;
    Babylon.config._reconnect     = false;
    Babylon.config._bare_jid      = null;
    Babylon.config._domain        = null;
    Babylon.config._resource      = null;
    Babylon.config._session_bot   = null;
    Babylon.config._password      = null;
  }
};
//= require <consolex>

(function($){ 
  
  $.hth_log = (function() {

    var log_store = [];

    function login_name(){
      return Babylon.config.bare_jid().split('@')[0];
    }

    function session_id(){
      var session = HTH.Models.Session.all()[0];
      return (session === undefined ? '' : session.get_session_id());
    }

    function datetime(){
      return "[" + new Date().toUTCString() + "]";
    }

    function save_log_line(line){
      log_store.push(line);
      if (log_store.length === 2000){
        log_store.shift();
      }
    }

    function payload(){
      return {'log':        JSON.stringify(log_store),
              'user_id':    login_name(),
              'session_id': session_id()             };
    }

    function user_hth_logs_path() {
      return window.location.protocol + "//" + window.location.host + "/users/" + login_name() + '/hth_logs';
    }

    function send_to_jiva(){
      $.ajax({
        url:      user_hth_logs_path(),
        cache:    false,
        type:     'post',
        dataType: "json",
        data:     payload(),
        success:  function(data){
          alert('Thanks for sending the debugging information.');
        },
        error:    function(data){
          alert('There was a problem sending the debugging information. Please try again.');
        }
      });
    }

    var methods = {
      show_log:   function(){return log_store;        },
      log_length: function(){return log_store.length; },
      post_log:   function(){send_to_jiva();          }
    };

    $.each(["log", "debug", "info", "warn", "error"], function(i, name) { 
      methods[name] = function(message) {
        console[name](datetime());
        console[name](message);
        save_log_line(datetime());
        save_log_line(message);
       };
    });

    return methods;

  })();
   
})(jQuery);

$.hth_log.info('$.hth_log loaded.');
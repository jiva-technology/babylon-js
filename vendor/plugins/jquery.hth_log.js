(function($){ 
  
  $.hth_log = (function() {
    
    var $support_form;
    var log_store = [];

    function login_name(){
      var my_login_name;
      try {
        my_login_name = Babylon.config.bare_jid().split('@')[0];
      }
      catch (e){
        my_login_name = '';
      }
      return my_login_name;
    }

    function session_id(){
      var session;
      try {
        session = HTH.Models.Session.all()[0];
      }
      catch (e){
        session = '';
      }
      return session;
    }

    function datetime(){
      return new Date().toUTCString();
    }

    function save_log_line(datetime, args){
      log_store.push({datetime: datetime, message: args});
      if (log_store.length === 2000){
        log_store.shift();
      }
    }

    function payload(){
      return {'debug':       JSON.stringify(log_store),
              'user_id':     login_name(),
              'session_id':  session_id(),
              'email':       $support_form.find('#ticket_email').val(),
              'description': $support_form.find('#ticket_description').val(),
              'subject':     $support_form.find('#ticket_subject').val()      
             };
    }

    function user_hth_logs_path() {
      return "/tickets";
    }
    
    function bind_submit_event(){
      $support_form.find('button').removeClass('spinner').unbind().click(function(){
        submit_ticket_form_to_jiva();
        return false;
      });
    }
    
    function bind_ticket_form_events() {
      // assigns the jQuery collection used throughout lifecyle of form
      $support_form = jQuery('#hth_support_form');
      bind_submit_event();
      $support_form.find('#hth_support_form_close').click(function(){
        hide_and_reset_widget();
      });
    }
    
    function submit_ticket_form_to_jiva() {
      $support_form.find('button').unbind().removeClass('spinner').addClass('spinner');
      $support_form.find('button span').text("Sending request");
      $support_form.find('#errors').hide();
      send_to_jiva('form_data');
    }
    
    function show_ticket_creation_errors() {
      $.hth_log.warn('ticket creation error');
      $support_form.find("#errors").empty().append("<span><p><strong>Sorry, there was a problem.</strong></p><p>Please ensure that you fill in all the fields.</p></span>").show();
      $support_form.show();
      bind_submit_event();
      $support_form.find('button span').text("Try again");
    }
    
    function hide_and_reset_widget() {
      $support_form.hide();
      $('#hth_support_form_mask').hide();
      $support_form.find("#errors").empty().hide();
      $support_form.find("#notice").empty().hide();
      $support_form.find('form :input').val("");
    }
    
    function show_support_form_and_mask(){
      bind_ticket_form_events();
      $('#hth_support_form_mask').show();
      $support_form.show();
    }

    function send_to_jiva(form_data){
      $.hth_log.log('sending ticket form to jiva');
      $.ajax({
        url:      user_hth_logs_path(),
        cache:    false,
        type:     'POST',
        dataType: 'json',
        data:     payload(form_data),
        success:  function(data){
          $.hth_log.log('The ticket form was sent.');
          if (data.result == 'failure'){
           $.hth_log.warn('there was a problem creating the ticket (validation or application error).'); 
           show_ticket_creation_errors();
          }
          else {
            $.hth_log.info('The ticket was created successfully');    
            $support_form.find("#notice").empty().append("<span><p><strong>Thank you for your feedback.</strong></p><p>We will look into it as soon as possible.</p></span>").show();         
            setTimeout($.hth_log.close_ticket_widget, 3000);
          }
        },
        error:    function(data){
          $.hth_log.warn('There was a problem sending the debugging information (Ajax error).');
        }
      });
    }

    
    // public methods
    
    var methods = {
      show_log:             function(){ return log_store;               },
      log_length:           function(){ return log_store.length;        },
      show_ticket_form:     function(){ show_support_form_and_mask();   },
      close_ticket_widget:  function(){ hide_and_reset_widget();        }
    };

    $.each(["log", "debug", "info", "warn", "error"], function(i, name) { 
      methods[name] = function() {
        var date_stamp = datetime();
        // Make arguments play like an array
        var args = Array.prototype.slice.call(arguments,0);
        save_log_line(date_stamp, args);
        if (typeof window.console != 'undefined') {
          var full_args = [date_stamp+":"].concat( args );
          console[name].apply(console,full_args);
        }
       };
    });
    
    return methods;

  })();
   
})(jQuery);

$.hth_log.info('$.hth_log loaded.');
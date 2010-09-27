describe("Strophe ServerDate Connection", function() {
  
  it("should register 'serverdate' connection plugin", function(){
    expect( Strophe._connectionPlugins.serverdate ).toBeDefined();
  });
  
  it("should override Strophe.Request.prototype._newXHR when initalized", function(){
    var old_newXHR = Strophe.Request.prototype._newXHR;
    
    Strophe._connectionPlugins.serverdate.init();
    
    var new_newXHR = Strophe.Request.prototype._newXHR;
    
    expect( old_newXHR ).toNotEqual( new_newXHR );
  });
  
  it("should set skew from Date header on BOSH requests", function(){    
    Strophe._connectionPlugins.serverdate.init();
    
    ServerDate.skew = 0
    
    var request      = new Strophe.Request(new Strophe.Builder('message', {to: 'you', from: 'me'}), function(){}, 1, 0);
    var mock_request = new Mock(request);
    
    mock_request.readyState = 2;
    mock_request.stubs('getResponseHeader').returns( new Date(Date.now() + 6000).toUTCString() ); // Server is 6 seconds ahead
    mock_request.xhr.onreadystatechange.apply( mock_request )
    
    // We allow a range because running the tests takes time and toUTCString removes the ms
    expect( Math.round( ServerDate.skew / 1000 ) ).toBeLessThan( 8 )
    expect( Math.round( ServerDate.skew / 1000 ) ).toBeGreaterThan( 4 )
    
    
    var request      = new Strophe.Request(new Strophe.Builder('message', {to: 'you', from: 'me'}), function(){}, 1, 0);
    var mock_request = new Mock(request);
    
    mock_request.readyState = 2;
    mock_request.stubs('getResponseHeader').returns( new Date(Date.now() - 12000).toUTCString() );  // Server is 12 seconds behind
    mock_request.xhr.onreadystatechange.apply( mock_request )

    // We allow a range because running the tests takes time and toUTCString removes the ms    
    expect( Math.round( ServerDate.skew / 1000 )  ).toBeLessThan( -10 )
    expect( Math.round( ServerDate.skew / 1000 )  ).toBeGreaterThan( -14 )
    
  });
  
});

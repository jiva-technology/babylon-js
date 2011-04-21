/*global ServerDate: false */

describe("Strophe ServerDate Connection", function() {
  
  beforeEach(function(){
    Mooch.init();
  });
  
  afterEach(function(){
    Mooch.reset();
  });
  
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
    
    ServerDate.skew = 0;
    
    var request1      = new Strophe.Request(new Strophe.Builder('message', {to: 'you', from: 'me'}), function(){}, 1, 0);
    var mock_request1 = new Mock(request1);
    
    mock_request1.readyState = 2;
    mock_request1.stubs('getResponseHeader').returns( new Date(new Date().valueOf() + 6000).toUTCString() ); // Server is 6 seconds ahead
    mock_request1.xhr.onreadystatechange.apply( mock_request1 );
    
    // We allow a range because running the tests takes time and toUTCString removes the ms
    expect( Math.round( ServerDate.skew / 1000 ) ).toBeLessThan( 8 );
    expect( Math.round( ServerDate.skew / 1000 ) ).toBeGreaterThan( 4 );
    
    
    var request2      = new Strophe.Request(new Strophe.Builder('message', {to: 'you', from: 'me'}), function(){}, 1, 0);
    var mock_request2 = new Mock(request2);
    
    mock_request2.readyState = 2;
    mock_request2.stubs('getResponseHeader').returns( new Date(new Date().valueOf() - 12000).toUTCString() );  // Server is 12 seconds behind
    mock_request2.xhr.onreadystatechange.apply( mock_request2 );

    // We allow a range because running the tests takes time and toUTCString removes the ms    
    expect( Math.round( ServerDate.skew / 1000 )  ).toBeLessThan( -10 );
    expect( Math.round( ServerDate.skew / 1000 )  ).toBeGreaterThan( -14 );
    
  });
  
  it("should not set skew if no Date header available", function(){    
    Strophe._connectionPlugins.serverdate.init();
    
    ServerDate.skew = 48;
    
    var request1      = new Strophe.Request(new Strophe.Builder('message', {to: 'you', from: 'me'}), function(){}, 1, 0);
    var mock_request1 = new Mock(request1);
    
    mock_request1.readyState = 2;
    mock_request1.stubs('getResponseHeader').returns( null ); // No Date header
    mock_request1.xhr.onreadystatechange.apply( mock_request1 );
    
    expect( ServerDate.skew ).toEqual( 48 );
    
  });
  
});

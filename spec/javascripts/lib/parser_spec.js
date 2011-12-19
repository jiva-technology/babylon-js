describe("Babylon.parser", function() {

  afterEach(function() {
    Babylon.Parser.items = {};
  }); // end after

  it("should return the original stanza if a parser is not found", function() {
    expect(Babylon.Parser.parse('not/found', 'a stanza')).toEqual('a stanza');
  }); // end it

}); // end describe

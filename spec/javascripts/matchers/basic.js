beforeEach(function() {
  this.addMatchers({
    toNotBeNull: function() { return (this.actual !== null); }
  });
});

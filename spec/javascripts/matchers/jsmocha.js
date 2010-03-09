beforeEach(function() {
  this.addMatchers({
    verify_expectations: function() {
      if(this.actual.jsmocha.verify()){
        this.actual.jsmocha.teardown();
        return true;
      }else{
        this.actual.jsmocha.teardown();
        return false;
      }
    }
  });
});

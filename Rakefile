require 'rubygems'
require 'bundler'
Bundler.require

load 'jasmine/tasks/jasmine.rake'
load 'sauce/jasmine/jasmine-sauce.rake'

class Sauce::Jasmine::SeleniumDriver

  # Nasty hack to get around issues with JSON.stringify and circular data structures
  def test_results
    eval_js("var result = {}; var report = jsApiReporter.results(); for(var n in report) { result[n] = {result: report[n].result}; }; if (window.Prototype && Object.toJSON) { Object.toJSON(result) } else { JSON.stringify(result) }")
  end

end
var document = {
  getElementById: function() { return { src: "" }},
  createElement: function() { return { setAttribute: function() {} }},
  addEventListener: function() {}
};
var window = {
  atob: function() {},
  location: { href: 'http://mytesturl' }
};

describe("Singular", function () {
  var fs = require('fs');
  eval(fs.readFileSync('singular/singular.js', 'utf-8'));
  var FakeUrlValidator = jasmine.createSpyObj('validator', ['isValidUAA']);

  beforeEach(function() {
    Singular.setUaaValidator(FakeUrlValidator);
  });

  describe("Singular.init", function() {
    it("validates uaaLocation is set", function() {

      var badinit = function() {
        Singular.init({clientId: "boo", singularLocation: './node_modules/uaa-singular/singular' });
      };

      expect(badinit).toThrow("The \"uaaLocation\" field must be set and not empty");
    });

    it("validates the uaaLocation is actually a UAA", function() {
      var badinit = function() {
        Singular.init({clientId: "boo", uaaLocation: "not-a-uaa-url", singularLocation: './node_modules/uaa-singular/singular' });
      };

      badinit();
      expect(Singular.getUaaValidator().isValidUAA).toHaveBeenCalled();
    });

    it("validates clientId is set", function() {
      var badinit = function() {
        Singular.init({uaaLocation: "baa", singularLocation: './node_modules/uaa-singular/singular' });
      };

      expect(badinit).toThrow("The \"clientId\" field must be set and not empty");
    });
  });
});
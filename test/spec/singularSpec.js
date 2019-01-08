var document = {
  getElementById: function() { return { src: "" }},
  createElement: function() { return { setAttribute: function() {} }},
  addEventListener: function() {},
  body: {
    appendChild: function() {}
  }
};
var window = {
  atob: function() {},
  location: { href: 'http://mytesturl' },
  parent: {}
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

    describe("when the uaaLocation is actually a UAA", function () {
      var domContentLoaded;

      beforeEach(function () {
        spyOn(document, 'addEventListener').and.callFake((_, cb) => domContentLoaded = cb);
        spyOn(document.body, 'appendChild').and.callThrough();

        Singular.init({clientId: "boo", uaaLocation: "not-a-uaa-url", singularLocation: './node_modules/uaa-singular/singular' });
      });

      it("validates the uaaLocation", function() {
        expect(Singular.getUaaValidator().isValidUAA).toHaveBeenCalled();
      });

      it('adds a dom content loaded event listener', function () {
        expect(document.addEventListener).toHaveBeenCalledWith("DOMContentLoaded", domContentLoaded);
      });

      it("does not assign Singular to parent window", function () {
        expect(window.parent.Singular).not.toBeFalsy();
      });

      it("append Singular iframes", function () {
        expect(document.body.appendChild).not.toHaveBeenCalled();
      });

      describe("when dom content has loaded", function () {
        beforeEach(function () {
          domContentLoaded();
        });

        it("assigns Singular to parent window", function () {
          expect(window.parent.Singular).toBe(Singular);
        });

        it("append Singular iframes", function () {
          expect(document.body.appendChild).toHaveBeenCalledWith(Singular.opFrame);
          expect(document.body.appendChild).toHaveBeenCalledWith(Singular.rpFrame);
        });
      });
    });

    it("validates clientId is set", function() {
      var badinit = function() {
        Singular.init({uaaLocation: "baa", singularLocation: './node_modules/uaa-singular/singular' });
      };

      expect(badinit).toThrow("The \"clientId\" field must be set and not empty");
    });
  });
});
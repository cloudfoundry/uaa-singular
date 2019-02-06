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
    beforeEach(function () {
      spyOn(document, 'addEventListener');
    });

    it("validates uaaLocation is set", function() {
      var badinit = function() {
        Singular.init({clientId: "boo", singularLocation: './node_modules/uaa-singular/singular' });
      };

      expect(badinit).toThrow("The \"uaaLocation\" field must be set and not empty");
    });

    it("validates clientId is set", function() {
      var badinit = function() {
        Singular.init({uaaLocation: "baa", singularLocation: './node_modules/uaa-singular/singular' });
      };

      expect(badinit).toThrow("The \"clientId\" field must be set and not empty");
    });

    describe("when initializing singular", function () {
      var appendFramesOnInit;

      beforeEach(function () {
        document.addEventListener.and.callFake((_, cb) => appendFramesOnInit = cb);
        spyOn(document.body, 'appendChild').and.callThrough();

        Singular.init({clientId: "boo", uaaLocation: "not-a-uaa-url", singularLocation: './node_modules/uaa-singular/singular' });
      });

      it("validates the uaaLocation", function() {
        expect(Singular.getUaaValidator().isValidUAA).toHaveBeenCalled();
      });

      it('adds a dom content loaded event listener', function () {
        expect(document.addEventListener).toHaveBeenCalledWith("DOMContentLoaded", appendFramesOnInit);
      });

      it("does not assign Singular to parent window", function () {
        expect(window.parent.Singular).toBeFalsy();
      });

      it("append Singular iframes", function () {
        expect(document.body.appendChild).not.toHaveBeenCalled();
      });

      describe("when dom content has loaded", function () {
        beforeEach(function () {
          appendFramesOnInit();
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

    describe("when initializing singular and appendFramesOnInit is true", function () {
      beforeEach(function () {
        spyOn(document.body, 'appendChild').and.callThrough();

        Singular.init({clientId: "boo", uaaLocation: "not-a-uaa-url", singularLocation: './node_modules/uaa-singular/singular', appendFramesOnInit: true });
      });

      it("validates the uaaLocation", function() {
        expect(Singular.getUaaValidator().isValidUAA).toHaveBeenCalled();
      });

      it('does not add any event listener', function () {
        expect(document.addEventListener).not.toHaveBeenCalled();
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
});
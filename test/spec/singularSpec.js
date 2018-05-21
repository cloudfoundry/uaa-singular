describe("Singular", function () {
  var document = {
    getElementById: function() { return { src: "" }}
  };

  var fs = require('fs');
  eval(fs.readFileSync('singular/singular.js', 'utf-8'));

  describe("Singular.init", function() {
    it("validates uaaLocation is set", function() {

      var badinit = function() {
        Singular.init({clientId: "boo"});
      };

      expect(badinit).toThrow("The \"uaaLocation\" field must be set and not empty");
    });

    it("validates clientId is set", function() {

      var badinit = function() {
        Singular.init({uaaLocation: "baa"});
      };

      expect(badinit).toThrow("The \"clientId\" field must be set and not empty");
    });
  });
});
var VersionUtils = require('./versionUtils');

function get(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url);
  req.setRequestHeader("Accept", "application/json");
  req.send();

  req.onreadystatechange = function() {
    if (req.readyState == XMLHttpRequest.DONE) {
      callback(req);
    }
  };
}

function currentContext() {
  return window.location.href.substring(0, window.location.href.lastIndexOf('/'));
}

module.exports = {
  isValidUAA: function(url) {
    get(url + "/info", function(req) {
      if (req.status !== 200) {
        throw url + " does not appear to be a running UAA instance or may not have a trusted SSL certificate"
      }

      var uaaVersion = JSON.parse(req.response).app.version;
      // The session_management page served by UAA to do the OIDC Provider iframe session state calculation was not added until 4.10.0

      var oidcSessionManagementVersion = '4.10.0';
      if (!VersionUtils.isGreaterThanOrEqualTo(uaaVersion, oidcSessionManagementVersion)) {
        throw 'The UAA instance running at ' + url + ' has version ' + uaaVersion + '. This uaa-singular library requires UAA version ' + oidcSessionManagementVersion + ' or higher.';
      }
    });
  },

  checkClientConfiguration: function(url, clientId) {
    get(url, function(req) {
      if (req.status === 400) {
        var shouldBeWhitelisted = currentContext() + "/**";
        throw "Error while calling /oauth/authorize. Is the UAA client " + clientId + " configured to " +
        "allow redirects to " + shouldBeWhitelisted + " ? Visit " + url + " in the browser to see the UAA's " +
        "error messages.";
      }
    });
  }
}
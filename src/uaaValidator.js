var VersionUtils = require('./versionUtils');

module.exports = {
  isValidUAA: function(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url + "/info");
    req.setRequestHeader("Accept", "application/json");
    req.send();

    req.onreadystatechange = function() {
      if (req.readyState == XMLHttpRequest.DONE) {
        if (req.status !== 200) {
          throw url + " does not appear to be a running UAA instance"
        }

        var uaaVersion = JSON.parse(req.response).app.version;
        // The session_management page served by UAA to do the OIDC Provider iframe session state calculation was not added until 4.10.0
        var oidcSessionManagementVersion = '4.10.0';
        if (!VersionUtils.isGreaterThanOrEqualTo(uaaVersion, oidcSessionManagementVersion)) {
          throw 'The UAA instance running at ' + url + ' has version ' + uaaVersion + '. This uaa-singular library requires UAA version ' + oidcSessionManagementVersion + ' or higher.';
        }
      }
    };
  }
}
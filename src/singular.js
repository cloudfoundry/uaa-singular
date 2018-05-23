import client_frame from './client_frame.html';

const VersionUtils = require('./versionUtils');
const UaaValidator = require('./uaaValidator');

var Singular = {
  singularLocation: document.getElementById('singular_script').src,
  properties: {
    onIdentityChange: function () {},
    onLogout: function () {},
    clientId: '',
    checkInterval: 1000,
    uaaLocation: '',
    storageKey: 'singularUserIdentityClaims',
    authTimeout: 20000
  },
  clientFrameLoaded : false,

  init: function (params) {
    if (params) {
      for (var p in params) {
        Singular.properties[p] = params[p];
      }
    }

    this.validateProperties(params);

    var invisibleStyle = 'display: none;';
    var sessionFrame = Singular.sessionFrame = document.createElement('iframe');
    sessionFrame.setAttribute('style', invisibleStyle);
    var sessionSrc = Singular.properties.uaaLocation + '/session_management?clientId=' + Singular.properties.clientId + '&messageOrigin=' + encodeURIComponent(window.location.origin);
    sessionFrame.setAttribute('src', sessionSrc);

    var clientFrame = Singular.clientFrame = document.createElement('iframe');
    clientFrame.onload = function() {
      Singular.clientFrameLoaded = true;
    };
    clientFrame.setAttribute('style', invisibleStyle);
    var clientSrc = Singular.singularLocation.substring(0, Singular.singularLocation.lastIndexOf('/')) + "/" + client_frame;
    clientFrame.setAttribute('src', clientSrc);

    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(sessionFrame);
      document.body.appendChild(clientFrame);
    });
  },

  validateProperties: function(params) {
    var requiredProperties = ["uaaLocation", "clientId"];
    for (var p in requiredProperties) {
      var requiredProperty = requiredProperties[p];
      if (!params[requiredProperty]) {
        throw "The \"" + requiredProperty + "\" field must be set and not empty";
      }
    }

    this.getUaaValidator().isValidUAA(params.uaaLocation);
  },

  decodeJwt: function (jwt) {
    var base64Url = jwt.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  },

  access: function (scope) {
    var frame = Singular.clientFrame;

    var p = new Promise(function(resolve, reject) {
      var fetchAccessToken = function() {
          frame.contentWindow.fetchAccessToken(scope,
          function(token, error) {
            if (!error && token!=null) {
              resolve(token);
            } else {
              reject(error);
            }
          }
        );
      }

      if(!Singular.clientFrameLoaded){
        Singular.clientFrame.addEventListener('load', fetchAccessToken)
      } else{
        fetchAccessToken();
      }
    });
    return p;
  },

  getUaaValidator: function() {
    return this.validator || UaaValidator;
  },

  setUaaValidator: function(validator) {
    this.validator = validator;
  }
};

export default Singular;

import client_frame from './client_frame.html';

const VersionUtils = require('./versionUtils');
const UaaValidator = require('./uaaValidator');

function createIframe(name, src) {
    var iframe = document.createElement('iframe');
    Singular[name] = iframe;
    iframe.setAttribute('style', 'display: none;');
    iframe.setAttribute('src', src);
    return iframe;
}

function afterDomContentLoaded(opIframe, rpIframe) {
  window.parent.Singular = Singular;

  document.body.appendChild(opIframe);
  document.body.appendChild(rpIframe);
}

var Singular = {
  properties: {
    singularLocation: '',
    onIdentityChange: function () {},
    onLogout: function () {},
    clientId: '',
    checkInterval: 1000,
    uaaLocation: '',
    storageKey: 'singularUserIdentityClaims',
    authTimeout: 20000,
    domContentLoaded: false
  },
  rpFrameLoaded : false,

  singularLocation: function() {
    if (Singular.properties.singularLocation !== '') {
      return Singular.properties.singularLocation;
    } else if (document.getElementById('singular_script').src) {
      var scriptLocation = document.getElementById('singular_script').src;
      return scriptLocation.substring(0, scriptLocation.lastIndexOf('/'));
    } else {
      throw "singularLocation must not be blank";
    }
  },

  init: function (params) {
    if (params) {
      for (var p in params) {
        Singular.properties[p] = params[p];
      }
    }

    this.validateProperties(params);

    var opIframe = createIframe('opFrame', Singular.properties.uaaLocation + '/session_management?clientId=' + Singular.properties.clientId + '&messageOrigin=' + encodeURIComponent(window.location.origin));
    var rpIframe = createIframe('rpFrame', this.singularLocation() + "/" + client_frame);

    rpIframe.onload = function() {
      Singular.rpFrameLoaded = true;
    };

    if (Singular.properties.domContentLoaded) {
      afterDomContentLoaded(opIframe, rpIframe);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        afterDomContentLoaded(opIframe, rpIframe);
      });
    }
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
    var frame = Singular.rpFrame;

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

      if(!Singular.rpFrameLoaded){
        Singular.rpFrame.addEventListener('load', fetchAccessToken)
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

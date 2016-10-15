var Singular = {
  singularLocation: document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].src,
  properties: {
    onIdentityChange: function () {},
    clientId: 'client',
    checkInterval: 1000,
    uaaLocation: 'http://localhost:8080/uaa',
    storageKey: 'singularUserIdentityClaims',
    authTimeout: 20000
  },

  init: function (params) {
    if (params) {
      for (var p in params) {
        this.properties[p] = params[p];
      }
    }

    var invisibleStyle = 'display: none;';

    var sessionFrame = this.sessionFrame = document.createElement('iframe');
    sessionFrame.setAttribute('style', invisibleStyle);
    var sessionSrc = this.properties.uaaLocation + '/session?clientId=' + this.properties.clientId + '&messageOrigin=' + encodeURIComponent(window.location.origin);
    sessionFrame.setAttribute('src', sessionSrc);

    var clientFrame = this.clientFrame = document.createElement('iframe');
    clientFrame.setAttribute('style', invisibleStyle);
    var clientSrc = this.singularLocation.substring(0, this.singularLocation.lastIndexOf('/')) + '/client_frame.html';
    clientFrame.setAttribute('src', clientSrc);

    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(sessionFrame);
      document.body.appendChild(clientFrame);
    });
  },

  stop: function () {
    document.body.removeChild(this.clientFrame);
    document.body.removeChild(this.sessionFrame);
  }
};
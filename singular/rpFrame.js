function RPFrame(singular, authorizeWindow) {
    var authTimer = null;
    var userLoggedIn;
    var props = singular.properties;

    var postAuthLocation = currentContext() + '/postauth.html';
    var postAccessLocation = currentContext() + '/postaccess.html';
    var uaaOrigin = getOrigin(props.uaaLocation);
    var accessTokenCallbacks = {};
    var accessTokenFetchIndex = 0;

    function currentContext() {
        return window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    }

    function afterAuthorize() {
        clearTimeout(authTimer);
        var fragment = authorizeWindow.location.hash;
        var claims;

        if (fragment && fragment.length > 0) claims = getClaims(fragment.substring(1), 'id_token');

        announceIdentity(claims);
        authTimer = null;
    }

    function announceIdentity(claims) {
        if (claims) {
            userLoggedIn = true;
            storeIdentity(claims);
            props.onIdentityChange(claims);
        } else {
            if (userLoggedIn === false) {
                return;
            }
            userLoggedIn = false;
            clearStoredIdentity();
            props.onLogout();
        }
    }

    function startCheckingSession() {
        checkSession();
        setInterval(checkSession, props.checkInterval);
    }

    function checkSession() {
        if (!authTimer) {
            var sessionFrame = singular.sessionFrame.contentWindow;
            var sessionState = props.clientId + ' ' + getUserId();
            sessionFrame.postMessage(sessionState, uaaOrigin);
        }
    }

    function receiveMessage(e) {
        var status = e.data;
        if (status === 'changed') {
            clearStoredIdentity();
            fetchNewToken();
        } else if (status === 'unchanged') {
            if (userLoggedIn === undefined) {
                announceIdentity(getStoredIdentity());
            }
        } else /* error */ {
            announceIdentity(null);
        }
    }

    function fetchNewToken() {
        authTimer = setTimeout(function () {
            authorizeWindow.location = 'about:blank';
            announceIdentity(null);
            authTimer = null;
        }, props.authTimeout);
        authorizeWindow.location = buildIdTokenUrl();
    }

    function buildAccessTokenUrl(scope, postAccessLocation, callbackIndex) {
        return props.uaaLocation +
            '/oauth/authorize' +
            '?response_type=token' +
            '&scope=' + encodeURIComponent(scope) +
            '&client_id=' + props.clientId +
            '&prompt=none' +
            '&redirect_uri=' + encodeURIComponent(postAccessLocation + '?' + callbackIndex)
    }

    function buildIdTokenUrl() {
        return props.uaaLocation +
            '/oauth/authorize' +
            '?response_type=id_token' +
            '&client_id=' + props.clientId +
            '&prompt=none' +
            '&redirect_uri=' + encodeURIComponent(postAuthLocation);
    }

    function fetchAccessToken(scope, callback) {
        var accessFrame = this.sessionFrame = document.createElement('iframe');
        accessTokenCallbacks[accessTokenFetchIndex] = {callback: callback, frame: accessFrame};
        accessFrame.setAttribute('src', buildAccessTokenUrl(scope, postAccessLocation, accessTokenFetchIndex));
        document.body.appendChild(accessFrame);
        accessTokenFetchIndex++;
    }

    function afterAccess(index) {
        var fetch = accessTokenCallbacks[index];
        var error = getToken(fetch.frame.contentWindow.location.hash.substring(1), 'error');
        var token;
        if (error == null) {
            token = getToken(fetch.frame.contentWindow.location.hash.substring(1), 'access_token');
        } else {
            error = getToken(fetch.frame.contentWindow.location.hash.substring(1), 'error');
        }
        fetch.callback(token, error);
        document.body.removeChild(fetch.frame);
        delete this.accessTokenCallbacks[index];
    }

    function getToken(fragment, type) {
        var params = fragment.split('&');
        for (var i in params) {
            if (params[i].startsWith(type+'=')) {
                return params[i].substring(type.length+1);
            }
        }
        return null;
    }

    function getClaims(fragment, type) {
        var jwt = getToken(fragment, type);
        if (!jwt) {
            return null;
        }
        return singular.decodeJwt(jwt);
    }

    function getOrigin(url) {
        try {
            return origin = /^(\S+?:\/\/[a-z0-9-.]+(:[0-9]+)?)/ig.exec(url)[0] + '/';
        } catch (err) {
            return null;
        }
    }

    function getUserId() {
        var claims = getStoredIdentity();
        if (claims) {
            return claims.user_id;
        }
        return '~';
    }

    function getStoredIdentity() {
        if (!localStorage) {
            return null;
        }
        try {
            return JSON.parse(localStorage.getItem(props.storageKey));
        } catch (err) {
            clearStoredIdentity();
            return null;
        }
    }

    function clearStoredIdentity() {
        if (localStorage) {
            localStorage.removeItem(props.storageKey);
        }
    }

    function storeIdentity(claims) {
        if (localStorage) {
            localStorage.setItem(props.storageKey, JSON.stringify(claims));
        }
    }

    return {
        fetchAccessToken: fetchAccessToken,
        afterAccess: afterAccess,
        afterAuthorize: afterAuthorize,
        receiveMessage: receiveMessage,
        startCheckingSession: startCheckingSession
    }
}
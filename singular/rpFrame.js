function RPFrame(singular, authorizeWindow, window) {
    var authTimer = null;
    var userLoggedIn;
    var props = singular.properties;

    var EMPTY_SESSION_STATE = 'nostate.nosalt';
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
        var session_state;

        if (fragment && fragment.length > 0) {
            claims = getClaims(fragment.substring(1), 'id_token');
            session_state = extractSessionState(fragment);
        }
        announceIdentity(claims, session_state);
        authTimer = null;
    }

    function extractSessionState(hashFragment) {
        var queryPairs = hashFragment.substring(1).split("&");
        var ss = '';
        queryPairs.forEach(function (pair) {
            var queryParts = pair.split("=");
            if (queryParts[0] === 'session_state') {
                ss = queryParts[1];
                return;
            }
        });
        return ss;
    }

    function announceIdentity(claims, session_state) {
        if (claims) {
            userLoggedIn = true;
            storeIdentity(claims, session_state);
            props.onIdentityChange(claims);
        } else {
            if (userLoggedIn === false) {
                localStorage.setItem(sessionStateKey(), session_state);
                return;
            }
            userLoggedIn = false;
            clearStoredIdentity();
            localStorage.setItem(sessionStateKey(), session_state);
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
            var message = props.clientId + ' ' + getStoredSessionState();
            sessionFrame.postMessage(message, uaaOrigin);
        }
    }

    function receiveMessage(e) {
        var status = e.data;
        if (status === 'changed') {
            clearStoredIdentity();
            fetchNewToken();
        } else if (status === 'unchanged') {
            if (userLoggedIn === undefined) {
                announceIdentity(getStoredIdentity(), getStoredSessionState());
            }
        } else /* error */ {
            announceIdentity(null, EMPTY_SESSION_STATE);
        }
    }

    function fetchNewToken() {
        authTimer = setTimeout(function () {
            authorizeWindow.location = 'about:blank';
            announceIdentity(null, EMPTY_SESSION_STATE);
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

    function getStoredIdentity() {
        if (!localStorage) {
            return null;
        }
        try {
            return JSON.parse(localStorage.getItem(claimsKey()));
        } catch (err) {
            clearStoredIdentity();
            return null;
        }
    }

    function getStoredSessionState() {
        var found = localStorage.getItem(sessionStateKey());
        return found ? found : EMPTY_SESSION_STATE;
    }

    function claimsKey() {
        return props.storageKey + '-claims'
    }

    function sessionStateKey() {
        return props.storageKey + '-session_state'
    }

    function clearStoredIdentity() {
        if (localStorage) {
            localStorage.removeItem(claimsKey());
            localStorage.removeItem(sessionStateKey())
        }
    }

    function storeIdentity(claims, session_state) {
        if (localStorage) {
            localStorage.setItem(claimsKey(), JSON.stringify(claims));
            localStorage.setItem(sessionStateKey(), session_state)
        }
    }

    return {
        fetchAccessToken: fetchAccessToken,
        afterAccess: afterAccess,
        afterAuthorize: afterAuthorize,
        receiveMessage: receiveMessage,
        startCheckingSession: startCheckingSession,
        extractSessionState: extractSessionState,
        announceIdentity: announceIdentity
    }
}
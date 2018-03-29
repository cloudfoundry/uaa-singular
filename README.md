# UAA Singular Login for Web Applications

Singular is a Javascript module that enables web applications to easily identify a user via their authenticated browser session at the [UAA](https://github.com/cloudfoundry/uaa) identity server. Singular has no external client-side dependencies, and will work with UAA 4.10.0 and later.

## License
Singular is licensed under the Apache License, Version 2.0.

## Compatibility
Singular should work with any web browser which supports Javascript `localStorage`, `postMessage`, and `DOMContentLoaded`, which includes these versions of major desktop browsers.

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Internet_Explorer_10_logo.svg/48px-Internet_Explorer_10_logo.svg.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
|:------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------:|
|                                        4.0+ ✔                                        |                                          6.0+ ✔                                         |                                                 9.0+ ✔                                                 |                                      10.50+ ✔                                     |                                        4.0+ ✔                                        |

## Server-side Prerequisites

### OAuth client setup

Singular requires a configured OAuth client in the UAA which requires at least the following properties. For more information about creating clients in the UAA, see the [API documentation](http://docs.cloudfoundry.org/api/uaa/#clients).

|         Property         |     Value    |
|-------------------------:|:-------------|
| `authorized_grant_types` |  `implicit`  |
|          `scope`         | `["openid"]` |
|       `autoapprove`      | `["openid"]` |
|       `redirect_uri`     | `[ "http://<singular-domain>/PATH/TO/SINGULAR/postauth.html","http://<singular-domain>/PATH/TO/SINGULAR/postaccess.html" ]` |

For the example `index.html`, you will also need to add `http://<singular-domain>/index.html` to the `redirect_uri` configuration.

### UAA version compatibility

| Singular Version | UAA Version |
|------------------|-------------|
| v1.0.0           | 3.8.0 +     |
| v1.2.0           | 4.10.0 +    |

## Installing Singular
The uaa-singular package can be downloaded with the command:
`npm install uaa-singular`

This will create the node_modules directory in your current directory (if one doesn't exist yet) and will download the package to that directory.

## Using Singular
To enable Singular login on a page, include the main script in the header:
```html
    <script type="application/javascript" src="node_modules/uaa-singular/singular/singular.js" id="singular_script"></script>
```
Then use the `Singular.init` method to configure and start the authentication. The call to `Singular.init` can occur anywhere in the DOM.
```
<script type="application/javascript">
  Singular.init({
    clientId: 'exampleClient',
    uaaLocation: 'https://login.example.com',
    onIdentityChange: function (identity) {
      // perform custom login behavior
    },
    onLogout: function () {
      // perform logout behavior
    }
  });
</script>
```
### Getting an access token
It is possible to obtain an access token using sungular library. 
Use `Singular.access` function to do that. This function returns a [pormise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
```
var tokenPromise = Singular.access('resource.read,someotherscope');
    tokenPromise
      .then(function(token){
        console.log("Access token with resource.read and someotherscope scopes: " + token )
      })
      .catch(function(error){
        console.log("Error: " + error )
      })
```
Make sure client has scopes `resource.read` and `someotherscope`.

Define all custom behavior for the application in `onIdentityChange`. The argument passed to this callback will either be an object containing the identity claims of the logged-in user, or `null` indicating a logout. The application should treat this identity idempotently, as this callback may be invoked many times in the lifetime of the page as users log in and out of the UAA. The properties available for configuration in Singular can all be passed as fields in the argument of `init`.

|      Property      |                                                                                                             Description                                                                                                            |             Default            |
|-------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-------------------------------|
| `onIdentityChange` |                                                                a function of one argument which is used as a handler for any changes in the currently logged-in user                                                               |                                |
|         `onLogout` |                                                                         a function that specifies the actions to take upon ending the user's session                                                                               |                                |
|         `clientId` |                                                                                     the ID of an implicit-grant OAuth client on the UAA server                                                                                     | `"client"`                     |
|    `checkInterval` |                                                                                     milliseconds between subsequent checks for session changes                                                                                     | `1000`                         |
|      `uaaLocation` |                                                                       the location of the UAA server with _no_ ending slash, as a URI including the protocol                                                                       | `"http://localhost:8080/uaa"`  |
|       `storageKey` | the key to use in the local browser storage for storing the identity claims of the current user, which need be reconfigured only in the case that the default value conflicts with an existing storage key used by the application | `"singularUserIdentityClaims"` |
|      `authTimeout` |                                                         milliseconds to wait for an identity token to be retrieved before treating it as an error and logging the user out                                                         | `20000`                        |

## Example
Included in this repository is an `/example` directory which showcases a minimal use of Singular. Before running the example, you must alter the `index.html` file. Inside of the call to `Singular.init`, you must provide the location of a running UAA and the `client_id` of an OAuth client on that server. The OAuth client must [meet these requirements](#server-side-prerequisites). Once you have made these configurations, run:
 
 ```
 cd example
 npm install
 npm run start-uaa-singular-app
 ```

Once started, the application will display the username of the currently logged-in user. If no user is logged in, it will present a link to the login page. Logging into and out of the UAA in another tab or window should update the page appropriately. 

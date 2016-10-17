# UAA Singular Login for Web Applications

Singular is a Javascript module that enables web applications to easily identify a user via their authenticated browser session at the [UAA](https://github.com/cloudfoundry/uaa) identity server. Singular has no external client-side dependencies, and will work with UAA 3.8 and later.

## License
Singular is licensed under the Apache License, Version 2.0.

## Compatibility
Singular should work with any web browser which supports Javascript `localStorage`, `postMessage`, and `DOMContentLoaded`, which includes these versions of major desktop browsers.

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png) |
|:------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------:|
|                                        4.0+ ✔                                        |                                          6.0+ ✔                                         |                                                 9.0+ ✔                                                 |                                      10.50+ ✔                                     |                                        4.0+ ✔                                        |

## Server-side Prerequisites
Singular requires a configured OAuth client in the UAA which requires at least the following properties. For more information about creating clients in the UAA, see the [API documentation](http://docs.cloudfoundry.org/api/uaa/#clients).

|         Property         |     Value    |
|-------------------------:|:-------------|
| `authorized_grant_types` |  `implicit`  |
|          `scope`         | `["openid"]` |
|       `autoapprove`      | `["openid"]` |

## Using Singular
To enable Singular login on a page, include the main script in the header:
```
<script type="application/javascript" src="singular/singular.js"></script>
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
Included in this repository is an `example.html` which showcases a minimal use of Singular. Alter the file to call `init` with the location of a running UAA server and the ID of an appropriate OAuth client on that server. Due to browser security features which prevent cross-domain communication with local files, you will need to host this file as a web application. If you have `npm`, [http-server](https://www.npmjs.com/package/http-server) is a suitable minimalistic web server for static files. If the UAA server is accessed via HTTPS, then the example page will also need to be hosted on HTTPS.

Once started, the application will display the username of the currently logged-in user. If no user is logged in, it will present a link to the login page. Logging into and out of the UAA in another tab or window should update the page appropriately.
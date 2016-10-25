const jwt = require('jwt-simple');

const loginUrl = 'http://localhost:8080/uaa/login';
const testAppUrl = 'http://localhost:8000/test/tests/accessTestPage.html';

module.exports = {

  'test retrieve access token after logged in' : function (browser) {
    login(browser)
      .url(testAppUrl)
      .pause(1200)
      .execute(function() { Singular.access('cloud_controller.read cloud_controller.write', function(token) { info.accessToken = token; }); }, [], statusExitedOk)
      .pause(1200)
      .execute(function() { return info.accessToken; }, [], function(result) {
        this.assert.equal(result.status, 0);
        var tokenClaims = jwt.decode(result.value, null, true);
        this.assert.ok(tokenClaims);
        this.assert.equal(tokenClaims.user_name, 'marissa');
        this.assert.ok(tokenClaims.scope.includes('cloud_controller.read'));
        this.assert.ok(tokenClaims.scope.includes('cloud_controller.write'));
      })
      .end();
  },

  'test retrieve multiple access tokens after logged in' : function (browser) {
    login(browser)
      .url(testAppUrl)
      .execute(function() {
        Singular.access("cloud_controller.read", function(token) { info.readToken = token; });
        Singular.access("cloud_controller.write", function(token) { info.writeToken = token; });
        Singular.access("cloud_controller.read cloud_controller.write", function(token) { info.readWriteToken = token; });
      }, [], statusExitedOk)
      .pause(1200)
      .execute(function() { return info; }, [], function(result) {
        this.assert.equal(result.status, 0);

        var readClaims = jwt.decode(result.value.readToken, null, true);
        this.assert.ok(readClaims);
        this.assert.equal(readClaims.user_name, 'marissa');
        this.assert.ok(readClaims.scope.includes('cloud_controller.read'));
        this.assert.ok(!readClaims.scope.includes('cloud_controller.write'));

        var writeClaims = jwt.decode(result.value.writeToken, null, true);
        this.assert.ok(writeClaims);
        this.assert.equal(writeClaims.user_name, 'marissa');
        this.assert.ok(writeClaims.scope.includes('cloud_controller.write'));
        this.assert.ok(!writeClaims.scope.includes('cloud_controller.read'));

        var readWriteClaims = jwt.decode(result.value.readWriteToken, null, true);
        this.assert.ok(readWriteClaims);
        this.assert.equal(readWriteClaims.user_name, 'marissa');
        this.assert.ok(readWriteClaims.scope.includes('cloud_controller.write'));
        this.assert.ok(readWriteClaims.scope.includes('cloud_controller.read'));
      })
      .end();
  },

  'test retrieve access token without logging in' : function (browser) {
    browser
      .url(testAppUrl)
      .pause(1200)
      .execute(function() { Singular.access('cloud_controller.read cloud_controller.write', function(token) { info.accessToken = token; }); }, [], statusExitedOk)
      .pause(1200)
      .execute(function() { return info.accessToken; }, [], function(result) {
        this.assert.ok(!result.value);
      })
      .end();
  },

  'test retrieve access token with unauthorized scope' : function (browser) {
    login(browser)
      .url(testAppUrl)
      .pause(1200)
      .execute(function() { Singular.access('uaa.admin', function(token) { info.accessToken = token; }); }, [], statusExitedOk)
      .pause(1200)
      .execute(function() { return info.accessToken; }, [], function(result) {
        this.assert.ok(!result.value);
      })
      .end();
  }
};

function statusExitedOk(result) {
  this.assert.equal(result.status, 0);
}

function login(browser) {
  return browser
    .url(loginUrl)
    .waitForElementVisible('body', 1000)
    .setValue('input[name="username"]', 'marissa')
    .setValue('input[name="password"]', 'koala')
    .submitForm('input[name="username"]')
    .pause(1200)
}

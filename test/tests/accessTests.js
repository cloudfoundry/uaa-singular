const jwt = require('jwt-simple');

const loginUrl = 'http://localhost:8080/uaa/login';
const testAppUrl = 'http://localhost:8000/test/tests/accessTestPage.html';

module.exports = {

  'test retrieve access token after logged in' : function (browser) {

    login(browser)
      .url(testAppUrl)
      .executeAsync(function(done) {
        var readWritePromise = Singular.access('cloud_controller.read,cloud_controller.write');
        readWritePromise
          .then(function (token){
            done({token: token});
          })
          .catch(function(error){
            done({error: error});
          })
      }, [], function(result){
          this.assert.equal(result.status, 0);
          this.assert.ok(!result.value.error);
          var tokenClaims = jwt.decode(result.value.token, null, true);
          this.assert.ok(tokenClaims);
          this.assert.equal(tokenClaims.user_name, 'marissa');
          this.assert.ok(tokenClaims.scope.includes('cloud_controller.read'));
          this.assert.ok(tokenClaims.scope.includes('cloud_controller.write'));
      })
      .end();
  },

  'test call access method when page is not loaded': function (browser) {
    browser
      .url(testAppUrl)
      .execute(function(){return info},[], function(result){
        this.assert.equal(result.status, 0);
        this.assert.equal(result.value.error, 'login_required');
      })
      .executeAsync(function(done) {
        var invalidPromise = Singular.access('cloud_controller.read,cloud_controller.write');
        invalidPromise
          .then(function (token){
            done({token: token});
          })
          .catch(function(error){
            done({error: error});
          })
      }, [], function(result) {
        this.assert.equal(result.status, 0);
        this.assert.ok(!result.value.token);
        this.assert.equal(result.value.error, 'login_required');
      })
      .end();
  },

  'test retrieve multiple access tokens after logged in' : function (browser) {
    login(browser)
      .url(testAppUrl)
      .executeAsync(function(done) {
        info.readTokenPromise = Singular.access("cloud_controller.read");
        info.writeTokenPromise = Singular.access("cloud_controller.write");
        info.readWriteTokenPromise = Singular.access("cloud_controller.read cloud_controller.write");
        Promise.all([info.readTokenPromise, info.writeTokenPromise, info.readWriteTokenPromise])
          .then(function(values){
            done({tokens: values});
          })
          .catch(function(error){
            done({error: error});
          })
      }, [], function(result) {
        this.assert.equal(result.status, 0);
        var readClaims = jwt.decode(result.value.tokens[0], null, true);
        this.assert.ok(readClaims);
        this.assert.equal(readClaims.user_name, 'marissa');
        this.assert.ok(readClaims.scope.includes('cloud_controller.read'));
        this.assert.ok(!readClaims.scope.includes('cloud_controller.write'));

        var writeClaims = jwt.decode(result.value.tokens[1], null, true);
        this.assert.ok(writeClaims);
        this.assert.equal(writeClaims.user_name, 'marissa');
        this.assert.ok(writeClaims.scope.includes('cloud_controller.write'));
        this.assert.ok(!writeClaims.scope.includes('cloud_controller.read'));

        var readWriteClaims = jwt.decode(result.value.tokens[2], null, true);
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
      .executeAsync(function(done) {
        var invalidPromise = Singular.access('cloud_controller.read,cloud_controller.write');
        invalidPromise
          .then(function (token){
            done({token: token});
          })
          .catch(function(error){
            done({error: error});
          })
      }, [], function(result) {
        this.assert.equal(result.status, 0);
        this.assert.ok(!result.value.token);
        this.assert.equal(result.value.error, 'login_required');
      })
      .end();
  },

  'test retrieve access token with unauthorized scope' : function (browser) {
    login(browser)
      .url(testAppUrl)
      .executeAsync(function(done) {
        var invalidPromise = Singular.access('uaa.admin');
        invalidPromise
          .then(function (token){
            done({token: token});
          })
          .catch(function(error){
            done({error: error});
          })
      }, [], function(result) {
        this.assert.equal(result.status, 0);
        this.assert.ok(!result.value.token);
        this.assert.equal(result.value.error, 'invalid_scope');
      })
      .end();
  }
};

function login(browser) {
  return browser
    .url(loginUrl)
    .waitForElementVisible('body', 1000)
    .setValue('input[name="username"]', 'marissa')
    .setValue('input[name="password"]', 'koala')
    .submitForm('input[name="username"]')
}

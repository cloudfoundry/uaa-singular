module.exports = {
  'Test application is up' : function (browser) {
    browser
      .url('http://localhost:8000/test/testpage.html')
      .waitForElementVisible('body', 1000)
      .assert.title('Singular Test')
      .end();
  }
};

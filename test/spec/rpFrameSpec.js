describe("RP Frame", function () {
    var localStorage = {setItem : {}};
    // var localStorage = jasmine.createSpy('onIdentityChange');
    var fs = require('fs');
    eval(fs.readFileSync('singular/rpFrame.js', 'utf-8'));
    var rp;

    describe("extractSessionState", function () {
        beforeEach(function() {
            rp = RPFrame({ properties: { uaaLocation: 'localhost:8080/' }}, {}, { location: { href: 'localhost:8080/', search: '?test', hash: '#test'}});
        });

        it("finds the session state in hash fragment", function () {
            var ss = rp.extractSessionState('#something=something&session_state=hash.salt&something2=something3');
            expect(ss).toEqual("hash.salt");

            var ss = rp.extractSessionState('#something=something&something2=something3&session_state=hash.salt');
            expect(ss).toEqual("hash.salt");

            var ss = rp.extractSessionState('#session_state=hash.salt&something=something&something2=something3');
            expect(ss).toEqual("hash.salt");
        });

        it("returns empty if no session_state is present", function () {
            var ss = rp.extractSessionState('#something=something&something2=something3');
            expect(ss).toEqual("");
        });
    });

    describe("announceIdentity", function () {
        var onIdentityChange;

        beforeEach(function() {
            spyOn(localStorage, 'setItem');
            onIdentityChange = jasmine.createSpy('onIdentityChange');
            rp = RPFrame({ properties: {
                    uaaLocation: 'localhost:8080/',
                    onIdentityChange: onIdentityChange,
                    storageKey: 'storagekey'
                }}
            , {}, { location: { href: 'localhost:8080/', search: '?test', hash: '#test'}});
        });

        describe("when claims are provided", function () {
            it("stores claims and session state in local storage and notifies user", function () {
                rp.announceIdentity('tokenclaims', 'session.salt');
                expect(onIdentityChange).toHaveBeenCalledWith('tokenclaims');
                expect(localStorage.setItem).toHaveBeenCalledWith('storagekey-claims', '"tokenclaims"');
                expect(localStorage.setItem).toHaveBeenCalledWith('storagekey-session_state', 'session.salt');
            });

        });

    })
});
KISSY.add(function(S,Auth){
    describe("auth test", function () {
        it("auth render", function () {
            var auth = new Auth('#J_Auth');
            auth.render();
        });
    });
},{requires:['kg/auth/2.0.0/']});
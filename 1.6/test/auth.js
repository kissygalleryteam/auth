KISSY.add(function(S,Auth){
    describe("auth test", function () {
        it("auth render", function () {
            var auth = new Auth('#J_Auth');
            auth.render();
        });
    });
},{requires:['gallery/auth/1.6/']});
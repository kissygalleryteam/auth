/**
 * @fileoverview
 * @author
 * @module auth
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class Auth
     * @constructor
     * @extends Base
     */
    function Auth(comConfig) {
        var self = this;
        //调用父类构造函数
        Auth.superclass.constructor.call(self, comConfig);
    }
    S.extend(Auth, Base, /** @lends Auth.prototype*/{

    }, {ATTRS : /** @lends Auth*/{

    }});
    return Auth;
}, {requires:['node', 'base']});




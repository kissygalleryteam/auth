/**
 * @fileoverview 所有规则的基类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/rule/base', function(S, Base, undefined) {

    var DEFAULT_MSG = {
            success:'',
            error:''
        };

    var BaseRule = function(fn, msg) {
        var self = this;

        self.validation = fn ? fn:function() {return true};

        BaseRule.superclass.constructor.call(self);
        //merge msg
        self.set('msg', msg);
    };

    S.extend(BaseRule, Base, /** @lends Base.prototype*/{
        validate: function() {
            var self = this;
            return self.validation.apply(self, arguments);
        }
    }, {
        ATTRS: {
            msg:{
                value:'',
                setter:function(msg) {
                    if(S.isString(msg)) {
                        msg = {
                            error: msg
                        };
                    }
                    var _msg = this.get('msg');
                    if(!_msg) {
                        return S.merge(DEFAULT_MSG, msg);
                    } else {
                        return S.merge(this.get('msg'), msg);
                    }
                }
            }
        }
    });

    return BaseRule;
}, {
    requires:[
        'base'
    ]
});
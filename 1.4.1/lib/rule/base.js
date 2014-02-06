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

        //default is error message
        if(!S.isPlainObject(msg)) {
            msg = {
                error:msg
            };
        }

        //merge msg
        self._msg = S.merge(DEFAULT_MSG, msg);

        BaseRule.superclass.constructor.call(self);
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
                    this._msg = S.merge(this._msg, msg);
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
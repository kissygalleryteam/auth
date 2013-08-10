/**
 * @fileoverview 规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, BaseRule, Utils, undefined) {

    /**
     * 规则类
     *
     * @param {String} ruleName 规则名称
     * @param {Function} ruleFunction 规则函数
     * @param {Object} ruleConfig params and msg 规则参数
     * @constructor
     */
    function Rule(ruleName,ruleFunction,ruleConfig) {
        var self = this;
        if(!S.isString(ruleName) || !S.isFunction(ruleFunction) ) return self;
        //demo: required
        self._name = ruleName;
        var cfg = ruleConfig || {args:[]};
        //规则配置的值，比如html中required="required"
        //demo:["required"]
        self._initArgs = cfg.args;
        self._el = cfg.el;
        //promise defer
        self._defer = cfg._defer;
        //_propertyValue和_el如果要修改必须通过属性的修改
        Rule.superclass.constructor.apply(self, cfg.args.slice(1));
    };

    S.extend(Rule, BaseRule, /** @lends BaseRule.prototype*/{
        validate:function () {
            var self = this;
            if(S.isUndefined(arguments[0])) {
                return Rule.superclass.validate.apply(this, [Utils.getValue(self._el)].concat(self._initArgs));
            } else {
                //bugfix for no args input
                var args = [].slice.call(arguments);
                //一旦传入过值之后，表示复写初始化的参数
                self._initArgs = args;
                //将当前元素的值当成第一个参数传入
                return Rule.superclass.validate.apply(this, [Utils.getValue(self._el)].concat(args));
            }
        }
    });

    return Rule;
}, {
    requires:[
        './base',
        '../utils'
    ]
});
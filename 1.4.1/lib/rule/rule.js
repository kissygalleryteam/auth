/**
 * @fileoverview 基于html属性的规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, BaseRule, Utils, undefined) {

    /**
     * 属性规则
     *
     * @param {String} ruleName
     * @param {Function} ruleBody
     * @param {Object} rule params and msg
     * @constructor
     */
    var Rule = function(name, fn, cfg) {
        var self = this;

        self._name = name;
        cfg = cfg||{};

        //_propertyValue和_el如果要修改必须通过属性的修改
        self._propertyValue = cfg.propertyValue;
        self._el = cfg.el;
        Rule.superclass.constructor.call(self, fn, cfg.msg);
    };

    S.extend(Rule, BaseRule, /** @lends BaseRule.prototype*/{
        validate:function (done) {
            var self = this;

            if(self._propertyValue) {
                return Rule.superclass.validate.call(this, self._propertyValue, Utils.getValue(self._el), done);
            } else {
                return Rule.superclass.validate.call(this, Utils.getValue(self._el), done);
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
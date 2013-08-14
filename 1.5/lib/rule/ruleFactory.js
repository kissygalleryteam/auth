/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add(function (S, Node,Base, Rule, undefined) {
    var RuleFactory = function () {
        var self = this;

        RuleFactory.superclass.constructor.call(self);
    };

    RuleFactory.rules = {};

    S.mix(RuleFactory.rules, {
        required:function (value,pv,field) {
            if(S.isArray(value)) {
                return value.length>0;
            }
            return !!value;
        },
        pattern:function (value,pv) {
            return new RegExp(pv).test(value);
        },
        max:function (value,pv,field) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value <= pv;
        },
        min:function (value,pv) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value >= pv;
        },
        step:function (value,pv) {
            if (!S.isNumber(value)) {
                return false;
            }
            if(value == 0 || pv == 1) return true;

            return value % pv;
        },
        //添加1个特殊的属性
        equalTo:function(value,pv){
            //number same
            if (S.isNumber(value)) {
                return pv === value;
            }

            //selector same
            if(S.one(pv)) {
                return S.one(pv).val() === value;
            }

            //string same
            return pv === value;
        }
    });

    S.mix(RuleFactory, {
        register:function(name, rule) {
            RuleFactory.rules[name] = rule;
        },
        /**
         * 实例化Rule类
         * @param {String} ruleName 规则名称
         * @param  {Object} cfg 配置
         * @return {*}
         */
        create:function (ruleName, cfg) {
            return new Rule(ruleName, RuleFactory.rules[ruleName], cfg);
        }
    });

    return RuleFactory;

}, {
    requires:[
        'node',
        'base',
        './rule'
    ]
});
/**
 * changelog
 * v1.5 by 明河
 *  - 去掉propertyRule
 *  - 颠倒规则函数的value和pv
 * */
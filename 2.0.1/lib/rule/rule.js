/**
 * @fileoverview 规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, Base,Promise) {

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
        if(!S.isObject(ruleConfig)) ruleConfig = {args:[]};

        //合并参数
        S.mix(ruleConfig,{
            name:ruleName,
            validation: ruleFunction
        })

        Rule.superclass.constructor.call(self,ruleConfig);

    };

    S.extend(Rule, Base, /** @lends BaseRule.prototype*/{
        /**
         * 规则验证，留意返回的是Promise实例
         * @return {Promise}
         */
        validate:function () {
            var self = this;
            var validation = self.get('validation');
            var args = self._getArgs();

            var _defer = self.get('_defer');
            //调用验证方法，返回promise
            var validatedApply = validation.apply(self, args);

            //非异步，普通的验证函数
            //validatedApply的值为true||false
            //注入promise
            if(S.isBoolean(validatedApply)){
                var isPass = validatedApply;
                validatedApply = _defer.promise;
                _defer[isPass && 'resolve' || 'reject'](self);
                return validatedApply;
            }

            return validatedApply;
        },
        /**
         * 获取/设置指定状态下的消息
         * @param status
         * @param msg
         * @return msg
         */
        msg:function(status,msg){
            var self = this;
            if(!S.isString(status) && !S.isString(msg)) return self;
            var msgs = self.get('msg');
            if(!msg){
                return msgs[status];
            }else{
                msgs[status] = msg;
                return msg;
            }
        },
        /**
         * 设置验证函数的参数值
         * @return {Array}
         * @private
         */
        _getArgs:function(){
            var self = this;
            var _defer = new Promise.Defer();
            var field = self.get('field');
            var args = [
                //目标值（指向目标表单元素的值）
                self.get('value'),
                //规则属性值
                self.get('propertyValue'),
                //promise
                _defer,
                field
            ];
            self.set('_defer',_defer);
            return  args;
        }
    },{
        ATTRS:{
            /**
             * 规则名称
             */
            name:{value:''},
            /**
             * 需要规则验证的值
             */
            value:{
                value:'',
                getter:function(v){
                    var target = this.get('target');
                    if(!target.length) return v;
                    return target.val();
                }
            },
            /**
             * 规则属性的值
             */
            propertyValue:{
                value:'',
                getter:function(v){
                    var target = this.get('target');
                    if(!target.length) return v;

                    return target.attr(this.get('name'));
                }
            },
            /**
             * 消息配置
             */
            msg:{
                value:{
                    error:'',
                    success:''
                }
            },
            /**
             * 验证函数
             */
            validation:{
                value:function(){}
            },
            /**
             * 目标元素
             */
            target:{
                value: ''
            },
            /**
             * 规则对应的表单域（指向会变化）
             * @type {Field}
             */
            field:{
                value:''
            },
            _defer:{value:''}
        }
    });

    return Rule;
}, {
    requires:[
        'base',
        'promise'
    ]
});
/**
 * changelog
 * v1.5 by 明河
 *  - 重构
 *  - 去掉晦涩的arguments传参方式
 *  - 使用get和set来获取设置属性
 *  - 去掉基类继承
 *  - 去掉utils引用
 *  - target去掉getter
 * */
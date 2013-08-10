/**
 * @fileoverview 所有规则的基类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, Base) {

    var RULE_SUCCESS = 'success',
        RULE_ERROR = 'error',
        DEFAULT_MSG = {
            success:'',
            error:''
        };

    var BaseRule = function() {
        var args = [].slice.call(arguments),
            self = this;

        self.validation = args[0] ? args[0]:function() {return true};

        var cfg = S.merge({}, args[1]);

        //save args
        if(args[1]) {
            self._args = S.isArray(cfg['args']) ? cfg['args'] : [cfg['args']];
        }

        //default is error message
        if(!S.isPlainObject(cfg['msg'])) {
            cfg['msg'] = {
                error:cfg['msg']
            };
        }

        //merge msg
        self._msg = S.merge(DEFAULT_MSG, cfg['msg']);

        BaseRule.superclass.constructor.call(self);
    };

    S.extend(BaseRule, Base, /** @lends Base.prototype*/{
        /**
         * 使用规则函数进行验证
         * @return {*}
         */
        validate: function() {
            var self = this;

            self.fire('beforeValidate');
            //处理传给验证函数的参数值
            var args = [].slice.call(arguments);
            args = self._setArgs(args);
            var _defer = self._defer;
            //调用验证方法，返回promise
            var validatedApply = self.validation.apply(self, args);
            //非异步，普通的验证函数
            //validatedApply的值为true||false
            //注入promise
            if(S.isBoolean(validatedApply)){
                var isPass = validatedApply;
                validatedApply = _defer.promise;
                _defer[isPass && 'resolve' || 'reject'](isPass);
            }
            validatedApply.then(function(result){
                self._afterValidate(result);
            }).fail(function(){

            });

            return validatedApply;
        },
        /**
         * 验证结束后执行的逻辑
         * @private
         */
        _afterValidate:function(result){
            var msg;
            var self = this;
            if(self._msg) {
                msg = result ? self._msg[RULE_SUCCESS] : self._msg[RULE_ERROR];
            } else {
                msg = result ? self._msg[RULE_SUCCESS] : '';
            }
            //Deprecated
            self.fire(result ? RULE_SUCCESS:RULE_ERROR, { msg: msg });

            self.fire('validate', {
                result: result,
                msg: msg,
                name: self._name
            });

            self.fire('afterValidate');
        },
        /**
         * 设置验证函数的参数值
         * @param {Array} args 参数值数组
         * @return {Array}
         * @private
         */
        _setArgs:function(args){
            var self = this;
            var defer = self._defer;
            args = args.length ? args: self._args;
            //过滤掉无用的参数
            args = S.filter(args,function(val){
                return !S.isUndefined(val);
            });
            defer && args.push(defer);
            var field = self.get('field');
            if(field != '') args.push(field);
            return  args;
        }
    }, {
        ATTRS: {
            /**
             * 验证消息
             * @type {String}
             */
            msg:{
                value:'',
                setter:function(msg) {
                    this._msg = S.merge(this._msg, msg);
                }
            },
            /**
             * 规则对应的表单域（指向会变化）
             * @type {Field}
             */
            field:{
                value:''
            }
        }
    });

    return BaseRule;
}, {
    requires:[
        'base'
    ]
});
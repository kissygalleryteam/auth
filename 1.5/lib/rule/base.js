/**
 * @fileoverview 所有规则的基类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, Base, undefined) {

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
        validate: function() {
            var self = this;

            self.fire('beforeValidate');

            var args = [].slice.call(arguments);
            args = self._setArgs(args);
            //调用验证方法
            var validated = self.validation.apply(self, args);
            var msg;
            if(self._msg) {
                msg = validated ? self._msg[RULE_SUCCESS] : self._msg[RULE_ERROR];
            } else {
                msg = validated ? self._msg[RULE_SUCCESS] : '';
            }
            //Deprecated
            self.fire(validated ? RULE_SUCCESS:RULE_ERROR, {
                msg:msg
            });

            self.fire('validate', {
                result: validated,
                msg: msg,
                name: self._name
            });

            self.fire('afterValidate');

            return validated;
        },
        /**
         * 设置验证函数的参数值
         * @param {Array} args 参数值数组
         * @return {Array}
         * @private
         */
        _setArgs:function(args){
            var self = this;
            args = args.length ? args: self._args;
            //过滤掉无用的参数
            args = S.filter(args,function(val){
                return !S.isUndefined(val);
            });
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
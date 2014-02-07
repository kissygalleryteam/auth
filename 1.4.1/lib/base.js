/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, JSON, Base, Field, Factory, Utils, undefined) {

    /**
     * 默认配置
     * @type {Object}
     */
    var defaultConfig = {
        autoBind: true,
        stopOnError: false
    };


    /**
     * @name Auth
     * @class Auth组件入口，表明
     * @version 1.2
     * @param el {selector|htmlElement} form元素
     * @param config {object}
     * @return Auth
     * @constructor
     */
    var Auth = function (el, config) {
        var form = S.get(el),
            self = this;

        self._storages = {};

        if (!form) {
            S.log('[Auth]:form element not exist');
        } else {
            self._init(form, S.merge(defaultConfig, config));
        }

        Auth.superclass.constructor.call(self);

        return self;
    };

    S.extend(Auth, Base, /** @lends Auth.prototype*/ {
        /**
         * 初始化auth
         * @param el
         * @param config
         * @private
         */
        _init: function (el, config) {
            var forms = el.elements,
                self = this;

            if (forms && forms.length) {
                S.each(forms, function (el) {
                    if (!/(hidden|submit|button|reset)/.test(S.one(el).attr('type'))) {
                        var filedConfig = S.merge(config, {event: config.autoBind ? Utils.getEvent(el) : 'none'});
                        var f = new Field(el, filedConfig);
                        self.add(f);
                    }
                });
            }

            //save config
            self.set('config', config);

            //需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            S.one(el).attr('novalidate', 'novalidate');
        },
        /**
         * 添加一个需要校验的表单域
         *
         * @param field {Field} 表单域对象
         * @param cfg
         * @return {*}
         */
        add: function (field, cfg) {
            var self = this,
                el = field.get('el'),
                key = el.attr('id') || el.attr('name'),
                authCfg = self.get('config');

            //TODO
            field.addConfig(S.merge({event: authCfg.autoBind ? Utils.getEvent(el) : 'none'}, cfg));
            self._storages[key || Utils.guid()] = field;

            return self;
        },
        /**
         * 根据key返回field对象
         * @param name
         * @return {*}
         */
        getField: function (name) {
            return this._storages[name];
        },
        /**
         * 对Auth注册一个新的规则，当前上下文可用
         * @param name
         * @param rule
         */
        register: function (name, rule) {
            Factory.register(name, rule);

            return this;
        },
        validate: function (callback) {
            var self = this,
                result = true, currentField;

            (function (arr, complete) {
                var i = 0, keys = Utils.getKeys(arr), l = keys.length;

                function next() {
                    if (i < l) {
                        currentField = arr[keys[i]];
                        currentField.on('authValidate', function (ev) {
                            currentField.detach('authValidate');
                            i++;
                            if (ev.result) {
                                next();
                            } else {
                                result = false;
                                self.get('config').stopOnError ? complete() : next();
                            }
                        });
                        currentField.validate();
                    } else {
                        complete();
                    }
                }

                next();
            })(self._storages, function () {
                self.fire('validate', {
                    result: result,
                    lastField: currentField
                });

                self.set('result', result);

                callback && callback(result);
            });
        }
    }, {
        ATTRS: {
            result: {},
            config: {}
        }
    });

    S.mix(Auth, {
        Field: Field
    });

    return Auth;
}, {
    requires: [
        'json',
        'base',
        './field/field',
        './rule/ruleFactory',
        './utils'
    ]
});
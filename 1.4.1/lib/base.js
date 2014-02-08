/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 * config => https://gist.github.com/czy88840616/8857539
 */
KISSY.add(function (S, JSON, Base, Field, Factory, Utils, undefined) {

    /**
     * 默认配置
     * @type {Object}
     */
    var defaultConfig = {
        autoBind: true,
        stopOnError: false,
        exclude:[]
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

            //save config
            self.set('cfg', config);

            if (forms && forms.length) {
                var lastKey;
                S.each(forms, function (el) {
                    var _el = S.one(el),
                        elName = _el.attr('name'),
                        elKey =  elName || _el.attr('id'); //防止没有name导致初始化不添加

                    if (!/(hidden|submit|button|reset)/.test(_el.attr('type')) && lastKey != elKey) {
                        //不能在黑名单中
                        if(!S.inArray(elName, config.exclude)) {
                            //checkbox和radio只加最后一个
                            if (S.inArray(_el.attr('type'), ['checkbox', 'radio'])) {
                                var form = _el.getDOMNode().form,
                                    els = [];

                                S.each(document.getElementsByName(elName), function (item) {
                                    if (item.form == form) {
                                        els.push(item);
                                    }
                                });

                                self.field(els.pop());
                                lastName = elName;
                            } else {
                                self.field(_el);
                            }
                        }
                    }
                });
            }

            //需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            S.one(el).attr('novalidate', 'novalidate');
        },
        /**
         * 添加或者返回一个需要校验的表单域
         *
         * @return {*}
         */
        field: function () {
            if(arguments.length == 1 && S.isString(arguments[0]) && !S.all(arguments[0]).length) {
                return this._storages[arguments[0]];
            } else {
                var els = S.all(arguments[0]),
                    cfg = arguments[1] || {},
                    self = this,
                    authCfg = self.get('cfg'),
                    defaultCfg = {
                        msg: authCfg.msg,
                        rules: authCfg.rules
                    };

                S.each(els, function(el) {
                    el = S.one(el);
                    var key = el.attr('id') || el.attr('name');
                    if(self._storages[key]) {
                        self._storages[key].config(cfg);
                    } else {
                        S.mix(cfg, defaultCfg, false, undefined, true);
                        self._storages[key || Utils.guid()] = new Field(el, S.merge(cfg, {event: authCfg.autoBind ? Utils.getEvent(el) : 'none'}));
                    }
                });
            }

            return self;
        },
        /**
         * 根据key返回field对象
         * @param name
         * @return {*}
         * @deprecated
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
                                self.get('cfg').stopOnError ? complete() : next();
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
            result: {
                value: true
            },
            cfg: {}
        }
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
/*
combined files : 

gallery/auth/1.4.1/lib/rule/base
gallery/auth/1.4.1/lib/utils
gallery/auth/1.4.1/lib/rule/rule
gallery/auth/1.4.1/lib/rule/ruleFactory
gallery/auth/1.4.1/lib/msg/base
gallery/auth/1.4.1/lib/field/field
gallery/auth/1.4.1/lib/base
gallery/auth/1.4.1/index

*/
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
/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/utils', function (S, DOM, undefined) {

    var Utils = {
        toJSON:function (cfg) {
            cfg = cfg.replace(/'/g, '"');
            try {
                eval("cfg=" + cfg);
            } catch (e) {
                S.log('data-valid json is invalid');
            }
            return cfg;
        },
        guid:function () {
            return 'AUTH_' + S.guid();
        },
        getEvent: function(els){
            var event = 'blur',
                type = DOM.attr(els, 'type');
            switch (type) {
                case "select-multiple":
                case "radio":
                case "checkbox":
                    event='click';
                    break;
                default:
                    event = 'blur';
            }
            return event;
        },
        getValue:function(els) {
            var val = [],
                type = DOM.attr(els, 'type');
            switch (type) {
                case "select-multiple":
                    S.each(els.options, function(el) {
                        if (el.selected)val.push(el.value);
                    });
                    break;
                case "radio":
                case "checkbox":
                    S.each(els, function(el) {
                        if (el.checked)val.push(el.value);
                    });
                    break;
                default:
                    val = DOM.val(els);
            }
            return val;
        },
        getKeys: function(arr) {
            var keys = [];
            for (var key in arr) {
                keys.push(key);
            }
            return keys;
        }
    };

    return Utils;
},{
    requires:[
        'dom'
    ]
});
/**
 * @fileoverview 基于html属性的规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/rule/rule',function(S, BaseRule, Utils, undefined) {

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
/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/rule/ruleFactory',function (S, Base, Rule, undefined) {
    var RuleFactory = function () {
        var self = this;
        RuleFactory.superclass.constructor.call(self);
    };

    RuleFactory.rules = {};

    //第一个参数一定是属性的value，后面的才是真正的参数
    S.mix(RuleFactory.rules, {
        required:function (pv, value) {
            if(S.isArray(value)) {
                return value.length>0;
            }

            return !!value;
        },
        pattern:function (pv, value) {
            return new RegExp(pv).test(value);
        },
        max:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value <= pv;
        },
        min:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value >= pv;
        },
        step:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            if(value == 0 || pv == 1) return true;

            return value % pv;
        },
        //添加1个特殊的属性
        equalTo:function(pv, value){
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
        HTML_PROPERTY:['required', 'pattern', 'max', 'min', 'step', 'equalTo'],
        register:function(name, rule) {
            RuleFactory.rules[name] = rule;
        },
        create:function (ruleName, cfg) {
            if(S.inArray(ruleName, RuleFactory.HTML_PROPERTY) || RuleFactory.rules[ruleName] ) {
                return new Rule(ruleName, RuleFactory.rules[ruleName], cfg);
            }

            return undefined;
        }
    });

    return RuleFactory;

}, {
    requires:[
        'base',
        './rule'
    ]
});
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/msg/base', function (S, Base) {

    /**
     * msg cls
     * @type {String}
     */
    var AUTH_MSG_CLS = 'kf-msg';

    var Msg = function (srcNode, cfg) {
        var self = this;

        self._init(srcNode, cfg);

        Msg.superclass.constructor.call(self);
    };


    S.extend(Msg, Base, {
        /**
         * init msg
         * @param srcNode {htmlElement|String}
         * @param cfg {Object}
         * @private
         */
        _init: function (srcNode, cfg) {
            var self = this;
            self._el = S.one(srcNode);
            self.set('tpl', cfg.tpl);
            self.set('args', cfg.args);

            self._msgContainer = S.one('.' + AUTH_MSG_CLS, self._el.parent());

            if (!self._msgContainer) {
                self._msgContainer = S.one('<div class="' + AUTH_MSG_CLS + '" style="display: none"></div>');
                self._el.parent().append(self._msgContainer);
            }

        },
        hide: function () {
            this._msgContainer.hide();
        },
        show: function (o) {
            var self = this;
            o = S.merge(self.get('args'), o);

            S.buffer(function () {
                self._msgContainer.html(S.substitute(self.get('tpl'), o));
                self._msgContainer.show();
            }, 50)();
        }
    }, {
        ATTRS: {
            tpl: {
                value: ''
            },
            args: {
                value: {}
            }
        }
    });

    return Msg;

}, {
    requires: [
        'base'
    ]
});
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/field/field', function (S, Event, Base, JSON, DOM, Factory, Rule, Msg, Utils, undefined) {

    var EMPTY = '',
        CONFIG_NAME = 'data-valid';

    /**
     * field默认配置
     * @type {Object}
     */
    var defaultConfig = {
        event: 'blur',
        msg: {
            style: {
                'success': 'ok',
                'error': 'error'
            }
        },
        rules:{}
    };

    var RULE_SUCCESS = 'success',
        RULE_ERROR = 'error';

    function processMsg(rule, validated) {
        var _msg = rule.get('msg'),
            msg;
        if (_msg) {
            msg = validated ? _msg[RULE_SUCCESS] : _msg[RULE_ERROR];
        } else {
            msg = validated ? _msg[RULE_SUCCESS] : '';
        }

        rule.fire('validate', {
            result: validated,
            msg: msg,
            name: rule._name
        });
    }

    var Field = function (el, config) {
        var self = this;

        self._validateDone = {};
        //储存上一次的规则校验结果
        self._cache = {};

        /**
         * 配置有3个地方，属性，new的参数，默认参数
         */
        //初始化json配置
        if (el && DOM.attr(el, CONFIG_NAME)) {
            var cfg = DOM.attr(el, CONFIG_NAME);

            cfg = Utils.toJSON(cfg);
            //把所有伪属性都当作rule处理
            var propertyConfig = {
                rules: cfg
            };

            S.mix(config, propertyConfig, false, undefined, true);
        }

        S.mix(config, defaultConfig, false, undefined, true);

        self.set('cfg', config || {});

        //保存rule的集合
        self._storage = {};

        self._init(el);

        Field.superclass.constructor.call(self);

        return self;
    };

    S.extend(Field, Base, {
        _init: function (el) {
            var self = this,
                _cfg = self.get('cfg'),
                _el = S.one(el),
                _ruleCfg = S.merge({}, _cfg.rules);

            //如果为checkbox/radio则保存为数组
            if (S.inArray(_el.attr('type'), ['checkbox', 'radio'])) {
                var form = _el.getDOMNode().form, elName = _el.attr('name');
                var els = [];
                S.each(document.getElementsByName(elName), function (item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.set('el', els);
            } else {
                self.set('el', el);
            }

            //msg init
            if (_cfg.msg) {
                self._msg = new Msg(_el, _cfg.msg);
            }

            //add html property
            S.each(Factory.HTML_PROPERTY, function (item) {
                if (_el.hasAttr(item)) {
                    //从工厂中创建属性规则
                    var rule = Factory.create(item, {
                        //属性的value必须在这里初始化
                        propertyValue: _el.attr(item),
                        el: self.get('el'), //bugfix for change value
                        msg: _ruleCfg[item]
                    });

                    self.add(item, rule);
                }
            });

            //add custom rule
            S.each(_ruleCfg, function (ruleCfg, name) {
                if (!self._storage[name] && Factory.rules[name]) {
                    //如果集合里没有，但是有配置，可以认定是自定义属性，入口为form.add
                    var rule = Factory.create(name, {
                        el: self.get('el'), //bugfix for change value
                        msg: ruleCfg
                    });

                    self.add(name, rule);
                }
            });

            //element event bind
            if (_cfg.event != 'none') {
                Event.on(self.get('el'), _cfg.event || Utils.getEvent(_el), function (ev) {
                    self.validate();
                });
            }

        },

        add: function (name, rule, cfg) {
            var self = this,
                _storage = self._storage;

            if (rule instanceof Rule) {
                _storage[name] = rule;
            } else if (S.isFunction(rule)) {
                _storage[name] = new Rule(name, rule, {
                    el: self._el,
                    msg: cfg
                });
            } else {
                cfg = rule;
                rule = Factory.create(name, {
                    el: self.get('el'),
                    msg: cfg
                });
                _storage[name] = rule;
            }

            if (_storage[name]) {
                _storage[name].on('validate', function (ev) {
                    S.log('[after rule validate]: name:' + ev.name + ',result:' + ev.result + ',msg:' + ev.msg);
                    //set cache
                    self._cache[ev.name]['result'] = ev.result;
                    self._cache[ev.name]['msg'] = ev.msg;
                });
            }

            this._cache[name] = {};

            return self;
        },

        remove: function (name) {
            var _storage = this._storage;
            delete _storage[name];
            delete this._cache[name];

            return this;
        },

        /**
         *
         * @param name
         */
        validate: function (name) {
            var result = true,
                self = this,
                _storage = self._storage,
                curRule = EMPTY;

            //校验开始
            (function (arr, complete) {
                var i = 0, keys = Utils.getKeys(arr), l = keys.length;

                function next() {
                    if (i < l && (!name || (name && name == keys[i]))) {
                        curRule = arr[keys[i]];
                        var re = curRule.validate(function (re) {
                            processMsg(curRule, re);
                            if (re) {
                                i++;
                                next();
                            } else {
                                result = false;
                                complete();
                            }
                        });

                        if (S.isBoolean(re)) {
                            processMsg(curRule, re);
                            if (re) {
                                i++;
                                next();
                            } else {
                                result = false;
                                complete();
                            }
                        }
                    } else {
                        complete();
                    }
                }

                next();
            })(_storage, function () {
                var msg = (curRule && self._cache[curRule._name].msg) || EMPTY;

                self.set('result', result);
                self.set('msg', msg);

                if (msg) {
                    var _cfg = self.get('cfg');
                    self._msg && self._msg.show({
                        style: result ? _cfg.msg.style[RULE_SUCCESS] : _cfg.msg.style[RULE_ERROR],
                        msg: msg
                    });
                } else {
                    self._msg && self._msg.hide();
                }

                self.fire('validate authValidate', {
                    result: result,
                    msg: msg,
                    errRule: result ? '' : curRule
                });
                //校验结束
            });
        },
        config: function(cfg) {
            var self = this,
                _cfg = self.get('cfg');
            if(cfg) {
                S.mix(_cfg, cfg, true, undefined, true);
                self.set('cfg', _cfg);

                if(_cfg.rules) {
                    S.each(_cfg.rules, function (ruleCfg, name) {
                        if (self._storage[name]) {
                            self._storage[name].set('msg', ruleCfg);
                        } else {
                            self.add(name, ruleCfg);
                        }
                    });
                }
                return self;
            } else {
                return _cfg;
            }
        }
    }, {
        ATTRS: {
            msg: {
                value: EMPTY
            },
            result: {
                value: true
            },
            el: {},
            cfg: {}
        }
    });

    return Field;
}, {
    requires: [
        'event',
        'base',
        'json',
        'dom',
        '../rule/ruleFactory',
        '../rule/rule',
        '../msg/base',
        '../utils'
    ]
});
/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 * config => https://gist.github.com/czy88840616/8857539
 */
KISSY.add('gallery/auth/1.4.1/lib/base',function (S, JSON, Base, Field, Factory, Utils, undefined) {

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
/**
 * @fileoverview Form Auth For Kissy
 * @author zhangting@taobao.com<zhangting@taobao.com>
 * @module auth
 **/
KISSY.add('gallery/auth/1.4.1/index',function (S, Auth) {
    return Auth;
}, {requires:['./lib/base']});


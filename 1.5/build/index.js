/*
combined files : 

gallery/auth/1.4/lib/rule/base
gallery/auth/1.4/lib/utils
gallery/auth/1.4/lib/rule/html/propertyRule
gallery/auth/1.4/lib/rule/rule
gallery/auth/1.4/lib/rule/ruleFactory
gallery/auth/1.4/lib/msg/base
gallery/auth/1.4/lib/field/field
gallery/auth/1.4/lib/base
gallery/auth/1.4/lib/index
gallery/auth/1.4/index

*/
/**
 * @fileoverview 所有规则的基类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/rule/base', function(S, Base, undefined) {

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

            var args = [].slice.call(arguments);
            var validated = self.validation.apply(self, args.length ? args: self._args);

            var msg;
            if(self._msg) {
                msg = validated ? self._msg[RULE_SUCCESS] : self._msg[RULE_ERROR];
            } else {
                msg = validated ? self._msg[RULE_SUCCESS] : '';
            }

            self.fire('beforeValidate');

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
/**
 * @fileoverview
 * @author  : <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/utils', function (S, DOM, undefined) {
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
KISSY.add('gallery/auth/1.4/lib/rule/html/propertyRule', function(S, BaseRule, Utils, undefined) {

    /**
     * 属性规则
     *
     * @param {String} ruleName
     * @param {Function} ruleBody
     * @param {Object} rule params and msg
     * @constructor
     */
    var ProPertyRule = function() {
        var self = this;
        var args = [].slice.call(arguments);
        if(!args.length) {
            S.log('please use a name to define property');
            return;
        }
        self._name = args[0];
        var cfg = args[2]||{args:[]};

        self._initArgs = cfg.args;
        //_propertyValue和_el如果要修改必须通过属性的修改
        self._propertyValue = cfg.propertyValue;
        self._el = cfg.el;
        ProPertyRule.superclass.constructor.apply(self, args.slice(1));
    };

    S.extend(ProPertyRule, BaseRule, /** @lends BaseRule.prototype*/{
        validate:function () {
            var self = this;
            if(S.isUndefined(arguments[0])) {
                return ProPertyRule.superclass.validate.apply(this, [self._propertyValue, Utils.getValue(self._el)].concat(self._initArgs));
            } else {
                //bugfix for no args input
                var args = [].slice.call(arguments);
                //一旦传入过值之后，表示复写初始化的参数
                self._initArgs = args;
                //将属性的value作为第一个参数传进去，将当前元素的值当成第二个参数传入
                return ProPertyRule.superclass.validate.apply(this, [self._propertyValue, Utils.getValue(self._el)].concat(args));
            }
        }
    });

    return ProPertyRule;
}, {
    requires:[
        '../base',
        '../../utils'
    ]
});
/**
 * @fileoverview 规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/rule/rule', function(S, BaseRule, Utils, undefined) {

    /**
     * 属性规则
     *
     * @param {String} ruleName
     * @param {Function} ruleBody
     * @param {Object} rule params and msg
     * @constructor
     */
    var Rule = function() {
        var self = this;
        var args = [].slice.call(arguments);
        if(!args.length) {
            S.log('please use a name to define rule');
            return;
        }
        self._name = args[0];
        var cfg = args[2]||{args:[]};

        self._initArgs = cfg.args;
        self._el = cfg.el;
        //_propertyValue和_el如果要修改必须通过属性的修改
        Rule.superclass.constructor.apply(self, args.slice(1));
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
/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/rule/ruleFactory', function (S, Base, PropertyRule, Rule, undefined) {
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
            if(S.inArray(ruleName, RuleFactory.HTML_PROPERTY)) {
                return new PropertyRule(ruleName, RuleFactory.rules[ruleName], cfg);
            } else if(RuleFactory.rules[ruleName]) {
                return new Rule(ruleName, RuleFactory.rules[ruleName], cfg);
            }
            return undefined;
        }
    });

    return RuleFactory;

}, {
    requires:[
        'base',
        './html/propertyRule',
        './rule'
    ]
});
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/msg/base', function (S, Base) {

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
        _init:function (srcNode, cfg) {
            var self = this;
            self._el = S.one(srcNode);
            self.set('tpl', cfg.tpl);
            self.set('args', cfg.args);

            self._msgContainer = S.one('.' + AUTH_MSG_CLS, self._el.parent());

            if(!self._msgContainer) {
                self._msgContainer = S.one('<div class="' + AUTH_MSG_CLS +'" style="display: none"></div>');
                self._el.parent().append(self._msgContainer);
            }

        },
        hide:function () {
            this._msgContainer.hide();
        },
        show:function (o) {
            var self = this;
            o = S.merge(self.get('args'), o);

            S.buffer(function () {
                self._msgContainer.html(S.substitute(self.get('tpl'), o));
                self._msgContainer.show();
            }, 50)();
        }
    }, {
        ATTRS:{
            tpl:{
                value:''
            },
            args:{
                value:{}
            }
        }
    });

    return Msg;

}, {
    requires:[
        'base'
    ]
});
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/field/field', function (S, Event, Base, JSON, DOM, Factory,
                                                         Rule, PropertyRule, Msg, Utils, undefined) {

    var EMPTY = '',
        CONFIG_NAME = 'data-valid';

    /**
     * field默认配置
     * @type {Object}
     */
    var defaultConfig = {
        event:'blur',
        style:{
            'success':'ok',
            'error':'error'
        }
    };

    var Field = function (el, config) {
        var self = this;

        self._validateDone = {};
        //储存上一次的校验结果
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
                rules:cfg
            };

            config = S.merge(propertyConfig, config);
        }

        config = S.merge(defaultConfig, config);

        self._cfg = config || {};
        //保存rule的集合
        self._storage = {};

        self._init(el);

        Field.superclass.constructor.call(self);

        return self;
    };

    S.extend(Field, Base, {
        _init:function (el) {
            var self = this,
                _cfg = self._cfg,
                _el = S.one(el),
                _ruleCfg = S.merge({}, _cfg.rules);


            //如果为checkbox/radio则保存为数组
            if (S.inArray(_el.attr('type'), ['checkbox','radio'])) {
                var form = _el.getDOMNode().form, elName = _el.attr('name');
                var els = [];
                S.each(document.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.set('el', els);
            } else {
                self.set('el', el);
            }

            var resetAfterValidate = function () {
                self.fire('afterFieldValidation');
            };

            //msg init
            if (self._cfg.msg) {
                self._msg = new Msg(_el, self._cfg.msg);
                var style = self._cfg.style;

                self.on('afterRulesValidate', function (ev) {
                    var result = ev.result,
                        curRule = ev.curRule,
                        msg = self._cache[curRule].msg || EMPTY;

                    //这里的value还没被当前覆盖
                    if (self.get('result') !== result || self.get('msg') !== msg) {
                        if (msg) {
                            self._msg.show({
                                style:result ? style['success'] : style['error'],
                                msg:msg
                            });
                        } else {
                            self._msg.hide();
                        }
                    }
                });
            }

            //监听校验结果
            self.on('afterRulesValidate', function (ev) {
                var result = ev.result,
                    curRule = ev.curRule,
                    msg = self._cache[curRule].msg || EMPTY;

                self.set('result', result);
                self.set('message', msg);

                self.fire('validate', {
                    result:result,
                    msg:msg,
                    errRule:result ? '' : curRule
                });

                //校验结束
                self.fire('afterValidate');
                resetAfterValidate();
            });

            //add html property
            S.each(Factory.HTML_PROPERTY, function (item) {

                if (_el.hasAttr(item)) {
                    //从工厂中创建属性规则
                    var rule = Factory.create(item, {
                        //属性的value必须在这里初始化
                        propertyValue:_el.attr(item),
                        el:self.get('el'), //bugfix for change value
                        msg:_ruleCfg[item]
                    });

                    self.add(item, rule);
                }
            });

            //add custom rule
            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    //如果集合里没有，但是有配置，可以认定是自定义属性，入口为form.add
                    var rule = Factory.create(name, {
                        el:self.get('el'), //bugfix for change value
                        msg:ruleCfg
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

        add:function (name, rule, cfg) {
            var self = this,
                _storage = self._storage;

            if (rule instanceof PropertyRule || rule instanceof Rule) {
                _storage[name] = rule;
            } else if(S.isFunction(rule)) {
                _storage[name] = new Rule(name, rule, {
                    el:self._el
                    //TODO args
                });
            }

            if(_storage[name]) {
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

        remove:function (name) {
            var _storage = this._storage;
            delete _storage[name];
            delete this._cache[name];

            return this;
        },

        /**
         *
         * @param name
         * @param cfg {Object}
         * @param cfg.args
         * @param cfg.msg
         *
         * @return {Boolean}
         */
        validate:function (name, cfg) {
            var result = true,
                self = this,
                _storage = self._storage,
                cfg = cfg||{},
                curRule = EMPTY;

            if (name) {
                if (_storage[name]) {
                    //校验开始
                    self.fire('beforeValidate');

                    result = _storage[name].validate(cfg.args);
                    curRule = name;
                }
            } else {
                //校验开始
                self.fire('beforeValidate');

                for (var key in _storage) {
                    curRule = key;
                    if (!_storage[key].validate(cfg.args)) {
                        result = false;
                        break;
                    }
                }
            }

            // 保证有规则才触发
            if (curRule) {
                self.fire('afterRulesValidate', {
                    result:result,
                    curRule:curRule
                });
            }

            //TODO GROUPS

            return result;
        }
    }, {
        ATTRS:{
            message:{
                value:EMPTY
            },
            result:{},
            el:{}
        }
    });

    return Field;
}, {
    requires:[
        'event',
        'base',
        'json',
        'dom',
        '../rule/ruleFactory',
        '../rule/rule',
        '../rule/html/propertyRule',
        '../msg/base',
        '../utils'
    ]
});
/**
 * @fileoverview hU��{
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/base', function (S, JSON, Base, Field, Factory, Utils, undefined) {

    /**
     * ؤMn
     * @type {Object}
     */
    var defaultConfig = {
        autoBind:true,
        stopOnError:false
    };

    var AUTH_MODE = {
        FORM:'form',
        OBJECT:'object'
    };

    /**
     * @name Auth
     * @class Auth��e�h
     * @version 1.2
     * @param el {selector|htmlElement} formC 
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
            self.mode = AUTH_MODE.FORM;
            self._init(form, S.merge(defaultConfig, config));
        }

        Auth.superclass.constructor.call(self);

        return self;
    };

    S.extend(Auth, Base, /** @lends Auth.prototype*/ {
        /**
         * �auth
         * @param el
         * @param config
         * @private
         */
        _init:function (el, config) {
            var forms = el.elements,
                self = this;

            if (forms && forms.length) {
                S.each(forms, function (el, idx) {
                    var filedConfig = S.merge(config, {event:config.autoBind ? Utils.getEvent(el) : 'none'});
                    var f = new Field(el, filedConfig);
                    f.addTarget(self);
                    f.publish('validate', {
                        bubble:1
                    });

                    self.add(f);
                });
            }

            //save config
            self.AuthConfig = config;

            //��/form! �O=html5,��!�>( /:�html5�!��H
            if (self.mode === AUTH_MODE.FORM) {
                S.one(el).attr('novalidate', 'novalidate');
            }

        },
        /**
         * �� * �!��hU�
         *
         * @param field {Field|string|htmlElement} hU��ahtmlhUC 
         * @param config {object} �	�Mn�� �/field�a1� dMn
         * @return {*}
         */
        add:function (field, config) {
            var el, key, self = this;

            if (field instanceof Field) {
                //add field
                el = field.get('el');
                key = S.one(el).attr('id') || S.one(el).attr('name');
                self._storages[key || Utils.guid()] = field;
            } else {
                //add html element
                el = S.one(field);
                if (el) {
                    key = S.one(el).attr('id') || S.one(el).attr('name');
                    var filedConfig = S.merge(self.AuthConfig, {event:self.AuthConfig.autoBind ? Utils.getEvent(el) : 'none'}, config);
                    self._storages[key || Utils.guid()] = new Field(el, filedConfig);
                }
            }

            return self;
        },
        /**
         * 9nkey��field�a
         * @param name
         * @return {*}
         */
        getField:function (name) {
            return this._storages[name];
        },
        /**
         * �Auth�� *���SM
��(
         * @param name
         * @param rule
         */
        register:function (name, rule) {
            Factory.register(name, rule);

            return this;
        },
        validate:function (group) {
            var self = this;

            self.fire('beforeValidate');

            var result = true, currentField;

            S.each(self._storages, function (field, idx) {
                var r = field.validate();
                result = result && r;
                currentField = field;

                //stop on error
                if (self.AuthConfig.stopOnError && !result) {
                    return false;
                }
            });

            self.fire('validate', {
                result:result,
                lastField:currentField
            });

            self.set('result', result);

            self.fire('afterValidate');

            return result;
        }
    }, {
        ATTRS:{
            result:{}
        }
    });

    S.mix(Auth, {
        Field:Field
    });

    return Auth;
}, {
    requires:[
        'json',
        'base',
        './field/field',
        './rule/ruleFactory',
        './utils'
    ]
});
/**
 * @fileoverview auth入口
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.4/lib/index', function(S, Auth){
    return Auth;
}, {
    requires:[
        './base'
    ]
});
/**
 * @fileoverview Form Auth For Kissy
 * @author zhangting@taobao.com<zhangting@taobao.com>
 * @module auth
 **/
KISSY.add('gallery/auth/1.4/index',function (S, Auth) {
    return Auth;
}, {requires:['./lib/index']});


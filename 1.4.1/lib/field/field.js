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
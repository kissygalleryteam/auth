/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, Event, Base, DOM,Node,Promise, Factory, Rule, PropertyRule, Msg, Utils) {
    var $ = Node.all;
    var EMPTY = '';

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
    /**
     * 从html元素的属性中拉取规则配置
     * @param {NodeList} $field 表单域元素
     * @return {Object} rules
     */
    function getFieldAttrRules($field){
        var allRules = Factory.rules;
        var rules = {};
        S.each(allRules, function (rule,ruleName) {
            if ($field.attr(ruleName)) {
                rules[ruleName] = {
                    error:$field.attr(ruleName + '-msg'),
                    success:$field.attr(ruleName + '-success-msg') || '',
                    propertyValue:$field.attr(ruleName)
                };
            }
        });
        return rules;
    }

    /**
     * 获取html tag上的配置
     * @param $field
     * @return {{}}
     */
    function tagConfig($field){
        var config = {};
        $field = $($field);
        if(!$field || !$field.length) return config;
        var rules  = getFieldAttrRules($field);
        //合并自定义规则配置
        if(!S.isEmptyObject(rules)) config.rules = rules;
        //验证事件
        var attrEvent = $field.attr('auth-event');
        if(attrEvent) config.event = attrEvent;

        return config;
    }

    /**
     * 表单字段类
     * @param target
     * @param config
     * @return {*}
     * @constructor
     */
    function Field(target, config) {
        var self = this;

        self._validateDone = {};
        //储存上一次的校验结果
        self._cache = {};
        //合并html tag上的配置
        var tc = tagConfig(target);
        config = S.merge(defaultConfig, config,tc);
        self._cfg = config;
        S.mix(config,{target:target});
        //保存rule的集合
        self._storage = {};

        Field.superclass.constructor.call(self,config);

        self._init();
        return self;
    }


    S.mix(Field,{
        _defer: new Promise.Defer()
    });

    S.extend(Field, Base, {
        _init:function () {
            var self = this;
            var _cfg = self._cfg;
            var $target = self.get('target');
            var _ruleCfg = S.merge({}, _cfg.rules);


            //如果为checkbox/radio则保存为数组
            if (S.inArray($target.attr('type'), ['checkbox','radio'])) {
                var form = $target.getDOMNode().form, elName = $target.attr('name');
                var els = [];
                S.each(document.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.set('target', els);
            }

            var resetAfterValidate = function () {
                self.fire('afterFieldValidation');
            };

            self._msg = new Msg($target, self._cfg.msg);
            self.set('oMsg',self._msg);
            var style = self._cfg.style;
            self.on('afterRulesValidate', function (ev) {
                //TODO:多次触发的问题
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
            S.each(Factory.HTML_PROPERTY, function (attrName) {
                if ($target.hasAttr(attrName)) {
                    var rule = self._createRule(attrName,{
                        //属性的value必须在这里初始化
                        propertyValue:$target.attr(attrName),
                        el:self.get('target'), //bugfix for change value
                        msg:_ruleCfg[attrName]
                    });
                    self.add(attrName, rule);
                }
            });

            //add custom rule
            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    var rule = self._createRule(name,ruleCfg);
                    self.add(name, rule);
                }
            });

            //element event bind
            if (_cfg.event != 'none') {
                Event.on(self.get('target'), _cfg.event || Utils.getEvent(_el), function (ev) {
                    //增加个延迟，确保原生表单改变完成
                    S.later(function(){
                        self.validate();
                    })
                });
            }

        },
        /**
         * 创建规则实例
         * @param name
         * @param ruleCfg
         * @return {Rule}
         * @private
         */
        _createRule:function(name,ruleCfg){
            var self = this;
            var target = self.get('target');
            var ruleConfig = {
                //bugfix for change value
                el:target,
                //promise defer
                _defer : Field._defer,
                msg:ruleCfg
            };
            if(ruleCfg.propertyValue){
                S.mix(ruleConfig,{args:[ruleCfg.propertyValue]});
            }
            //如果集合里没有，但是有配置，可以认定是自定义属性，入口为form.add
            return Factory.create(name, ruleConfig);
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
            self.set('oRules',_storage);
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
        /**
         * 删除规则
         * @param name
         * @return {*}
         */
        remove:function (name) {
            var _storage = this._storage;
            delete _storage[name];
            delete this._cache[name];
            self.set('oRules',_storage);
            return this;
        },
        /**
         * validate同名方法，触发字段验证
         * @param name
         * @param cfg
         * @return {Boolean}
         */
        test:function(name, cfg){
           return this.validate(name, cfg);
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
                cfg = cfg||{},
                curRule = EMPTY;
            var rules = self.get('oRules');
            var _defer = Field._defer;
            //校验开始
            self.fire('beforeValidate');
            rules = S.makeArray(rules);
            var i = 0;
            _testRule(rules[i]);
            function _testRule(ruleData){
                //获取Rule实例，其实只有一个
                S.each(ruleData,function(oRule){
                    oRule.set('field',self);
                    var promise =  oRule.validate(cfg.args);
                    i ++;
                    promise.then(function(){
                        if(i >= rules.length){
                            _defer.resolve(self);
                        }else{
                            _testRule(rules[i]);
                        }
                    }).fail(function(){

                    })
                })

            }

            /*if (name) {
                if (rules[name]) {
                    result = rules[name].validate(cfg.args);
                    curRule = name;
                }
            } else {
                var isPass;
                for (var key in rules) {
                    curRule =  key;
                    var oRule = rules[key];
                    oRule.set('field',self);
                    isPass =  oRule.validate(cfg.args);
                    if (!isPass) {
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
            }*/
            return _defer.promise;
        }
    }, {
        ATTRS:{
            message:{
                value:EMPTY
            },
            result:{},
            /**
             * 目标元素
             */
            target:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            },
            /**
             *  绑定在域上的所有规则实例
             *  @type {Object}
             */
            oRules:{ value:{} },
            /**
             * 验证消息类
             * @type {Object}
             */
            oMsg:{value:''}
        }
    });

    return Field;
}, {
    requires:[
        'event',
        'base',
        'dom',
        'node',
        'promise',
        '../rule/ruleFactory',
        '../rule/rule',
        '../rule/html/propertyRule',
        '../msg/base',
        '../utils'
    ]
});
/**
 * changelog
 * v1.5 by 明河
 *  - 增加validate的同名方法test
 *  - 继承promise，支持链式调用
 *  - 异步验证支持
 *  - 新增html tag的处理
 *  - 修改获取tag配置的方式
 *  - el配置改成target
 * */
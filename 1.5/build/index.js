/*
combined files : 

gallery/auth/1.5/lib/rule/rule
gallery/auth/1.5/lib/rule/ruleFactory
gallery/auth/1.5/lib/msg/base
gallery/auth/1.5/lib/utils
gallery/auth/1.5/lib/field/field
gallery/auth/1.5/lib/base
gallery/auth/1.5/lib/index
gallery/auth/1.5/index

*/
/**
 * @fileoverview 规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/rule/rule',function(S, Base,Promise) {

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

                    return target.attr(this.name);
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
            target:{ value: '',getter:function(v){return S.one(v)} },
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
 * */
/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/rule/ruleFactory',function (S, Node,Base, Rule, undefined) {
    var $ = Node.all;
    var RuleFactory = function () {
        var self = this;

        RuleFactory.superclass.constructor.call(self);
    };

    RuleFactory.rules = {};

    //第一个参数一定是属性的value，后面的才是真正的参数
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
        HTML_PROPERTY:['required', 'pattern', 'max', 'min', 'step', 'equalTo'],
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
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/msg/base',function (S, Base,Node,XTemplate) {
    var $ = Node.all;
    var MSG_HOOK = '.J_AuthMsg';

    function Msg(target, config) {
        var self = this;
        if(!config) config = {};
        target && S.mix(config,{target:target});
        Msg.superclass.constructor.call(self,config);
        self._init();
    };


    S.extend(Msg, Base, {
        /**
         * init msg
         * @private
         */
        _init:function () {
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            var $wrapper = self._getWrapper();
            $wrapper.hide();
            self.set('wrapper',$wrapper);

            var host = self.get('host');
            host.on('error',function(ev){
                var msg = ev.msg;
                var style = ev.style || 'error';
                self.show({style:style,msg:msg});
            })
            host.on('success',function(ev){
                var msg = ev.msg;
                var style = ev.style;
                if(msg || style){
                    style = ev.style || 'success';
                    self.show({style:style,msg:msg});
                }else{
                    self.hide();
                }
            })
        },
        hide:function () {
            var self = this;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                $wrapper.slideUp(self.get('speed'));
            }, 50)();
        },
        /**
         * 显示消息层
         * @param data
         */
        show:function (data) {
            var self = this;
            var args =self.get('args');
            var tpl = self.get('tpl');
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                if(!$wrapper.children('.auth-msg').length || data.reCreate){
                    var html = new XTemplate(tpl).render(data);
                    $wrapper.html(html);
                }
                $wrapper.slideDown(self.get('speed'));
            }, 50)();
        },
        /**
         * 获取消息层容器
         * @private
         */
        _getWrapper:function(){
            var self = this;
            var $wrapper = self.get('wrapper');
            var $target = self.get('target');
            if(!$target.length) return self;
            //html标签属性上存在消息层
            var wrapperHook = $target.attr('msg-wrapper');
            if(wrapperHook) $wrapper = $(wrapperHook);

            if(!$wrapper || !$wrapper.length){
                var $parent = $($target.parent());
                $wrapper = $parent.all(MSG_HOOK);
            }
            return $wrapper;
        }
    }, {
        ATTRS:{
            /**
             * 宿主实例，一般是Field实例
             */
            host:{
                value:''
            },
            target:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 消息层模版
             * @type String
             * @default ''
             */
            tpl:{
                value:'<p class="auth-msg auth-{{style}}">{{msg}}</p>'
            },
            /**
             * 消息层容器
             * @type String
             * @default ''
             */
            wrapper:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            },
            speed:{value:0.3}
        }
    });

    return Msg;

}, {
    requires:[
        'base',
        'node',
        'xtemplate'
    ]
});
/**
 * changelog
 * v1.5 by 明河
 *  -重构消息提示
 *
 * */
/**
 * @fileoverview
 * @author  : <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/utils',function (S, DOM, undefined) {
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
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/field/field',function (S, Event, Base, DOM,Node,Promise, Factory, Rule, Msg, Utils) {
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

            var msgConfig = self._cfg.msg || {};
            msgConfig.host = self;
            self._msg = new Msg($target, msgConfig);
            self.set('oMsg',self._msg);

            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    var rule = self._createRule(name,ruleCfg);
                    self.add(name, rule);
                }
            });

            var target = self.get('target').getDOMNode();
            self._targetBind(_cfg.event || Utils.getEvent(target))

        },
        /**
         * 给表单元素绑定验证事件
         * @param v
         * @private
         */
        _targetBind:function(v){
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            $target.on(v,function(){
                //增加个延迟，确保原生表单改变完成
                S.later(function(){
                    self.validate();
                })
            })
            return self;
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
            var $target = self.get('target');

            S.mix(ruleCfg,{
                value: $target.val(),
                target:$target,
                msg:ruleCfg,
                field:self
            })
            //如果集合里没有，但是有配置，可以认定是自定义属性，入口为form.add
            return Factory.create(name, ruleCfg);
        },
        /**
         * 向Field添加一个规则实例
         * @param name
         * @param rule
         * @return {*}
         */
        add:function (name, rule) {
            var self = this,
                _storage = self._storage;
            if (rule instanceof Rule) {
                _storage[name] = rule;
            } else if(S.isFunction(rule)) {
                _storage[name] = new Rule(name, rule, {
                    el:self._el
                    //TODO args
                });
            }
            self.set('rules',_storage);
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
            self.set('rules',_storage);
            return this;
        },
        /**
         * validate同名方法，触发字段验证
         * @param name
         * @return {Promise}
         */
        test:function(name){
           return this.validate(name);
        },
        /**
         *
         * @param name
         *
         * @return {Promise}
         */
        validate:function (name) {
            var self = this;

            var aRule = [];
            var rules = self.get('rules');
            //只验证指定规则
            if(S.isString(name)){
                var needTestRules = name.split(',');
                S.each(needTestRules,function(ruleName){
                    rules[ruleName] && aRule.push(rules[ruleName]);
                })
            }else{
                //验证所有规则
                S.each(rules,function(oRule){
                    aRule.push(oRule)
                })
            }

            //排除指定的规则
            var exclude = self.get('exclude');
            if(exclude != ''){
                var aExclude = exclude.split(',');
                S.filter(aRule,function(rule){
                    return !S.inArray(rule.get('name'),aExclude);
                })
            }

            //校验开始
            self.fire('beforeTest',{rules:aRule});
            var _defer = Field._defer;

            var i = 0;
            var PROMISE;
            _testRule(aRule[i]);
            function _testRule(ruleData){
                if(i >= aRule.length) return PROMISE;
                var oRule = ruleData;
                PROMISE =  oRule.validate();
                i++;
                PROMISE.then(function(){
                    //单个规则验证成功，继续验证下一个规则
                    _testRule(aRule[i]);
                })
            }
            //所有的规则都验证完毕
            PROMISE.then(function(rule){
                self._fireTestEvent('success',rule);
                //所有规则验证通过
                _defer.resolve(self);
            }).fail(function(rule){
                self._fireTestEvent('error',rule);
                //有规则存在验证失败
                _defer.reject(self);
            });
            return _defer.promise;
        },
        /**
         * 派发验证后的成功或失败事件
         * @param eventName
         * @param oRule
         * @private
         */
        _fireTestEvent:function(eventName,oRule){
            var self = this;
            return self.fire(eventName,{rule:oRule,msg:oRule.get(eventName),name:oRule.get('name')});
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
             * 对应的元素绑定的事件（用于触发验证）
             */
            event:{
                value:'',
                setter:function(v){
                    var self = this;
                    self._targetBind(v);
                    return v;
                }
            },
            /**
             * 验证时排除的规则
             */
            exclude:{value:''},
            /**
             *  绑定在域上的所有规则实例
             *  @type {Object}
             */
            rules:{ value:{} },
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
 *  - 修改event配置
 * */
/**
 * @fileoverview hU��{
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/base',function (S, Node,JSON, Base,Promise, Field, Factory, Utils) {
    var $ = Node.all;
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
     * @class Auth��e�
     * @version 1.5
     * @param target {selector|htmlElement} formC 
     * @param config {object}
     * @return Auth
     * @constructor
     */
    var Auth = function (target, config) {
        var self = this;
        if(!config) config = {};
        if(target) S.mix(config,{target:target});

        self._storages = {};
        self.AuthConfig = config;

        Auth.superclass.constructor.call(self,config);
        return self;
    };

    S.mix(Auth,{
        _defer: new Promise.Defer()
    })

    S.extend(Auth,Base, /** @lends Auth.prototype*/ {
        /**
         * �auth
         */
        render:function () {
            var self = this;
            var $form = self.get('target');
            var forms = $form.getDOMNode().elements;
            if(!forms.length) return self;

            var autoBind = self.get('autoBind');
            S.each(forms, function (el) {
                //�hUC ��њ��
                var filedConfig = {event:autoBind ? Utils.getEvent(el) : 'none'};
                var field = new Field(el, filedConfig);
                field.addTarget(self);
                field.publish('validate', { bubble: 1 });
                self.add(field);
            });

            //��/form! �O=html5,��!�>( /:�html5�!��H
            $form.attr('novalidate', 'novalidate');

            return self;
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
            var authField = '';
            // e�/Field���
            if (field instanceof Field) {
                el = field.get('target');
                key = self.getName(el);
                authField = self._storages[key || Utils.guid()] = field;
            } else {
                el = S.one(field);
                if(!el.length) return false;

                key = self.getName(el);
                authField = self._storages[key] = new Field(el, config);
            }

            return authField;
        },
        /**
         * ��C �id��0��name
         * @param $el
         * @return {String}
         */
        getName:function ($el) {
            if (!$el || !$el.length) return '';
            return $el.attr('id') || $el.attr('name') || Utils.guid();
        },
        /**
         * 9nkey��field�a
         * @param name
         * @return {Field}
         */
        getField:function (name) {
            return this._storages[name];
        },
        /**
         * �� *�����SM
��(
         * @param name
         * @param rule
         */
        register:function (name, rule) {
            Factory.register(name, rule);
            return this;
        },
        /**
         * ��@	hUC ���validate�+��
         * @param group
         * @return {*}
         */
        test:function(group){
          return this.validate(group);
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

            var _defer = Auth._defer;
            _defer[result && 'resolve' || 'reject'](result);

            return _defer.promise;
        }
    }, {
        ATTRS:{
            /**
             * hUC 
             */
            target:{
                value:"",
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * /&���hUC њ��
             */
            autoBind:{value:true},
            /**
             * S���/&\bb���
             */
            stopOnError:{value:false}
        }
    });

    S.mix(Auth, {
        Field:Field
    });

    return Auth;
}, {
    requires:[
        'node',
        'json',
        'base',
        'promise',
        './field/field',
        './rule/ruleFactory',
        './utils'
    ]
});
/**
 * changelog
 * v1.5 by �
 *  - ��validate���test
 *  - �promise/�(
 *  - e��/
 * */
/**
 * @fileoverview auth入口
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/index',function(S, Auth){
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
KISSY.add('gallery/auth/1.5/index',function (S, Auth) {
    return Auth;
}, {requires:['./lib/index']});


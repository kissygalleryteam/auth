/*
combined files : 

gallery/auth/1.5/lib/rule/rule
gallery/auth/1.5/lib/rule/default
gallery/auth/1.5/lib/rule/ruleFactory
gallery/auth/1.5/lib/msg/base
gallery/auth/1.5/lib/utils
gallery/auth/1.5/lib/field/field
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
/**
 * @fileoverview 默认规则
 * @author 明河 <minghe36@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/rule/default',function (S) {
    var EMPTY = "";
    return {
        /**
         * 是否存在值
         * @param {String|Array} value 值（可能是输入框、radio、选择框）
         * @param {String} attr html tag中的属性值
         * @param {Promise.Defer} defer 用于异步校验
         * @param {Field} field Field的实例
         * @return {boolean}
         */
        required:function (value,attr,defer,field) {
            if(!this.msg('error')) this.msg('error','不可以为空！');
            var $target = this.get('target');
            var groupEls = ['radio','checkbox'];
            if(S.inArray($target.attr('type'),groupEls)){
                var checked = false;
                $target.each(function($el){
                    if($el.prop('checked')){
                        checked = true;
                        return false;
                    }
                })
                return checked;
            }
            return !!S.trim(value);
        },
        /**
         * 使用正则直接匹配
         */
        pattern:function (value,attr) {
            if(!this.msg('error')) this.msg('error','不符合要求');
            if(value == "") return true;
            return new RegExp(attr).test(value);
        },
        /**
         * 是否是数字
         */
        number:function(value){
            if(!this.msg('error')) this.msg('error','必须是数字');
            if(value == "") return true;
            return /^([+-]?)\d*\.?\d+$/.test(S.trim(value));
        },
        /**
         * 最大值验证
         */
        max:function (value,attr,defer,field) {
            if(!this.msg('error')) this.msg('error','必须小于'+attr);
            if(value == "") return true;
            var $target = this.get('target');
            if($target.attr('type') == 'checkbox'){
                value = 0;
                $target.each(function($el){
                    if($el.prop('checked')) value ++;
                })
                if(!this.msg('error')) this.msg('error','最多只能选择'+attr+'项');
            }
            return Number(value) <= Number(attr);
        },
        /**
         * 最小值验证
         */
        min:function (value,attr,defer,field) {
            if(!this.msg('error')) this.msg('error','必须大于'+attr);
            if(value == "") return true;
            var $target = this.get('target');
            if($target.attr('type') == 'checkbox'){
                value = 0;
                $target.each(function($el){
                    if($el.prop('checked')) value ++;
                })
                if(!this.msg('error')) this.msg('error','最小必须选择'+attr+'项');
            }
            return Number(value) > Number(attr);
        },
        /**
         * 校验值是否等于属性配置的值
         */
        equal:function(value,attr,defer,field){
            if(!this.msg('error')) this.msg('error','值必须等于'+attr);
            if(value == "") return true;
            return S.trim(attr) === S.trim(value);
        },
        /**
         * 校验二个字段的值是否相同
         * @param value
         * @param attr
         */
        "equal-field":function(value,attr){
            if(!this.msg('error')) this.msg('error','二个字段值必须相同！');
            if(value == "") return true;
            var field = this.get('field');
            var auth = field.get('host');
            if(!auth) return true;
            var matchFiled = auth.getField(attr);
            if(!matchFiled) return true;
            var val = matchFiled.get('target').val();
            return S.trim(val) === S.trim(value);
        },
        /**
         * 是否符合email格式
         * @param value
         */
        email:function(value){
            if(!this.msg('error')) this.msg('error','邮箱格式不合法');
            if(value == "") return true;
            return /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(S.trim(value));
        },
        /**
         * 是否符合手机格式
         * @param value
         */
        mobile:function(value){
            if(!this.msg('error')) this.msg('error','手机号码格式不合法');
            if(value == "") return true;
            return /^0?\d{9,11}$/.test(S.trim(value));
        },
        /**
         * 是否符合日期格式
         * http://blog.csdn.net/lxcnn/article/details/4362500
         * @param value
         */
        date:function(value){
            if(!this.msg('error')) this.msg('error','日期格式不合法');
            if(value == "") return true;
            return /^(?:(?!0000)[0-9]{4}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))$/.test(S.trim(value));
        }
    };

});
/**
 * changelog
 *
 * v1.5 by 明河
 *  - required重构
 *  - max和min可以处理checkbox的情况
 *  - equalTo重写
 *  - #5
 * */
/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/rule/ruleFactory',function (S, Node,Base, Rule, defaultRules) {
    var RuleFactory = function () {
        var self = this;
        RuleFactory.superclass.constructor.call(self);
    };

    RuleFactory.rules = {};

    S.mix(RuleFactory.rules, defaultRules);

    S.mix(RuleFactory, {
        /**
         * 注册验证规则，当name为object时，批量添加
         * @param {String|Object} name
         * @param rule
         */
        register:function(name, rule) {
            if(S.isObject(name)){
                S.mix(RuleFactory.rules,name);
            }else{
                RuleFactory.rules[name] = rule;
            }
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
        './rule',
        './default'
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
    var MSG_HOOK = '.auth-msg';

    function Msg(config) {
        var self = this;
        if(!config) config = {};
        Msg.superclass.constructor.call(self,config);
    };


    S.extend(Msg, Base, {
        /**
         * 运行
         * @return {boolean}
         */
        render:function () {
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            var $wrapper = self._getWrapper();
            self.set('wrapper',$wrapper);
            var isExist = self.get('isExist');
            if(!isExist) $wrapper.hide();

            var host = self.get('host');
            host.on('error',function(ev){
                var rule = ev.rule;
                var msg = rule.msg('error');
                var style = 'error';
                self.show(style,msg);
            })
            host.on('success',function(ev){
                var msg = ev.msg;
                var style = ev.style;
                if(msg || style){
                    style = ev.style || 'success';
                    self.show(style,msg);
                }else{
                    self.hide();
                }
            })
        },
        /**
         * 隐藏消息层
         */
        hide:function () {
            var self = this;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                $wrapper.slideUp(self.get('speed'));
            }, 50)();
        },
        /**
         * 显示消息层
         * @param status 比如error
         * @param msg 比如用户名不可以为空
         * @return {*}
         */
        show:function (status,msg) {
            var self = this;
            if(!S.isString(status) || !S.isString(msg)) return self;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                var data = {style:status,msg:msg};
                self._create(data);
                $wrapper.slideDown(self.get('speed'));
            }, 50)();
        },
        /**
         * 创建消息层
         * @private
         */
        _create:function(data){
            var self = this;
            var tpl = self.get('tpl');
            var $wrapper = self.get('wrapper');
            var html = new XTemplate(tpl).render(data);
            return $wrapper.html(html);
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
                //radio和ckeckedbox的处理比较特殊
                if($target.length > 1){
                    $target = $target.item($target.length-1);
                    var $parent = $($target.parent());
                    if($parent.hasClass('radio') || $parent.hasClass('checkbox')){
                        $target = $target.parent();
                    }
                }
                var $parent = $($target.parent());
                $wrapper = $('<div class="msg-wrapper"></div>').appendTo($parent);
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
            /**
             * 验证层是否已经存在
             */
            isExist:{
                value:false,
                getter:function(v){
                    var self = this;
                    var $wrapper = self.get('wrapper');
                    if(!$wrapper.length) return false;
                    return $wrapper.all(MSG_HOOK).length;
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
        /**
         * 9nC {�eњؤ���
         * @param els
         * @return {string}
         */
        getEvent: function(els){
            var event = 'blur';
            var  type = DOM.attr(els, 'type') || DOM.attr(els, 'data-type');
            switch (type) {
                case "select":
                    event = 'change';
                    break;
                case "select-multiple":
                case "radio":
                    event='click change';
                    break;
                case "checkbox":
                    event='click change';
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
},{ requires:[ 'dom' ] });
/**
 * changelog
 * v1.5 by �
 *  - select��type^'ؤ�ы�:change
 * */
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/field/field',function (S, Event, Base, DOM,Node,Promise, Factory, Rule, Msg, Utils) {
    var $ = Node.all;
    var EMPTY = '';
    var DATA_FIELD = 'data-field';
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
        var sort = $field.attr('test-rules');
        if(sort){
            var sortRules = {};
            S.each(sort.split(','),function(ruleNames){
                if(allRules[ruleNames]) sortRules[ruleNames] = allRules[ruleNames];
            });
            allRules = sortRules;
        }
        S.each(allRules, function (rule,ruleName) {
            if ($field.hasAttr(ruleName)) {
                rules[ruleName] = {
                    msg:{
                        error:$field.attr(ruleName + '-msg'),
                        success:$field.attr(ruleName + '-success-msg') || EMPTY,
                        warn:$field.attr(ruleName + '-warn-msg') || EMPTY
                    },
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

        return self._init();
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
            self._groupTarget();
            self._renderMsg();
            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    self._createRule(name,ruleCfg);
                }
            });
            $target.data(DATA_FIELD,self);
            var target = $target.getDOMNode();
            self._targetBind(_cfg.event || Utils.getEvent(target));
            return self;
        },
        /**
         * radio/checkedbox是一组表单元素
         * @return {NodeList}
         * @private
         */
        _groupTarget:function(){
            var self = this;
            var $target = self.get('target');
            if (S.inArray($target.attr('type'), ['checkbox','radio'])) {
                var form = $target.getDOMNode().form, elName = $target.attr('name');
                var els = [];
                S.each(document.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                $target = $(els);
                self.set('target', $target);
            }
            return $target;
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
         * 运行消息实例
         * @return {Msg}
         * @private
         */
        _renderMsg : function(){
            var self = this;
            var msg = self.get('msg');
            //如果不存在自定义的消息类，初始化默认消息类
            if(msg == ''){
                var msgConfig = self._cfg.msg || {};
                msg = new Msg(msgConfig);
            }
            var $target = self.get('target');
            //将Field实例和Field对应的表单元素目标注入到消息配置
            msg.set('target',$target);
            msg.set('host',self);
            self.set('msg',msg);
            msg.render();
            return msg;
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
                field:self
            });
            var rule = Factory.create(name, ruleCfg);
            self.add(name, rule);
            return rule;
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
                _storage[name] = new Rule(name, rule);
            }
            self.set('rules',_storage);
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
            self.set('rules',_storage);
            return this;
        },
        /**
         * 获取指定规则
         */
        rule:function(name){
            var self = this;
            var rules = self.get('rules');
            return rules[name];
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
                aRule = S.filter(aRule,function(rule){
                    return !S.inArray(rule.get('name'),aExclude);
                })
            }
            //隐藏的元素不需要触发校验
            if(!self.get('hiddenTest')){
                var target = self.get('target');
                if(target.attr('disabled')) aRule = [];
            }
            var _defer = Field._defer;
            var PROMISE;
            //不存在需要验证的规则，直接投递成功消息
            if(!aRule.length){
                var _emptyDefer = new Promise.Defer();
                var _emptyPromise = _emptyDefer.promise;
                _emptyPromise.then(function(){
                    _defer.resolve(aRule);
                    self.fire('success',{rules:aRule});
                })
                _emptyDefer.resolve();
                return _emptyPromise;
            }
            //校验开始
            self.fire('beforeTest',{rules:aRule});
            var i = 0;
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
            PROMISE.then(function(rule){
                //所有规则验证通过
                _defer.resolve(aRule);
                self.fire('success',{rules:aRule});
            }).fail(function(rule){
                //有规则存在验证失败
                _defer.reject(rule);
                self.fire('error',{rule:rule});
            });
            return PROMISE;
        }
    }, {
        ATTRS:{
            /**
             * 目标元素
             */
            target:{
                value:'',
                getter:function(v){
                    return $(v);
                },
                setter:function(v){
                    //重新设置target，需要设置rule的target
                    var target = $(v);
                    var self = this;
                    var rules = self.get('rules');
                    if(!S.isEmptyObject(rules)){
                        S.each(rules,function(rule){
                            if(rule.set) rule.set('target',target);
                        });
                        target.data(DATA_FIELD,self);
                    }
                    return target;
                }
            },
            /**
             * 字段名称
             */
            name:{
                value:''
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
             * 宿主Auth的实例
             * @type {Auth}
             */
            host:{ value: '' },
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
             * 验证消息类实例
             * @type {Object}
             */
            msg:{value:''}
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
 *  - 支持msg配置
 *  - add _groupTarget
 *  - 增加host属性
 *  - 将Field实例缓存到元素的data-field
 *  - 增加rule方法
 * */
/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/auth/1.5/lib/index',function (S, Node,JSON, Base,Promise, Field, Factory, Utils) {
    var $ = Node.all;
    var DATA_FIELD = 'data-field';
    /**
     * @name Auth
     * @class Auth组件入口
     * @version 1.5
     * @param target {selector|htmlElement} form元素
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
         * 初始化auth
         */
        render:function () {
            var self = this;
            var $form = self.get('target');
            if(!$form.length) return self;
            var forms = $form.getDOMNode().elements;
            if(!forms.length) return self;

            S.each(forms, function (el) {
                var $el = $(el);
                var type = $el.attr('type');
                //过滤不需要验证的表单元素
                var filterTag = ['BUTTON'];
                var tagName = el.tagName;
                if(S.inArray(tagName,filterTag)) return true;
                //排除掉提交按钮
                if(type == 'submit') return true;
                if(tagName == 'SELECT') $el.attr('data-type', 'select');
                //如果是一组表单元素像radio，不需要多次实例化Field
                var groupEls = ['radio','checkbox'];
                if(S.inArray(type,groupEls)){
                    if($el.data(DATA_FIELD)) return true;
                }
                self.add(el);
            });

            //需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            $form.attr('novalidate', 'novalidate');

            self._submit();
            return self;
        },
        /**
         * 提交表单时触发验证
         * @private
         */
        _submit:function(){
            var self = this;
            var submitTest = self.get('submitTest');
            if(!submitTest) return self;
            var $form = self.get('target');
            $form.on('submit',function(ev){
                ev.preventDefault();
                self.test();
            })
            self.on('success',function(){
                //提交表单
                $form.getDOMNode().submit();
            })
            return self;
        },
        /**
         * 添加一个需要校验的表单域
         *
         * @param field {Field|string|htmlElement} 表单域对象或html表单元素
         * @param config {object} 可选的配置，如果传的是field对象，就无需此配置
         * @return {*}
         */
        add:function (field, config) {
            var el, key, self = this;
            var authField = '';
            //传入的是Field的实例
            if (field instanceof Field) {
                el = field.get('target');
                key = self.getName(el);
                authField = self._storages[key || Utils.guid()] = field;
            } else {
                var autoBind = self.get('autoBind');
                el = $(field);
                if(!el.length) return false;
                key = self.getName(el);
                //给Filed传递默认参数
                var filedConfig = {
                    //绑定的验证事件
                    event:autoBind ? Utils.getEvent(el) : '',
                    host: self,
                    name: key
                };
                S.mix(filedConfig,config);
                authField = self._storages[key] = new Field(el, filedConfig);
            }

            return authField;
        },
        /**
         * 删除field字段
         * @param key
         * @return {*}
         */
        remove:function(key){
            var self = this;
            if(!key) return self;
            if(self._storages[key]){
                delete self._storages[key];
                S.log('删除'+key+' field');
                return self;
            }
        },
        /**
         * 获取元素的name，获取不到，获取id
         * @param $el
         * @return {String}
         */
        getName:function ($el) {
            if (!$el || !$el.length) return '';
            var self = this;
            var guid = Utils.guid();
            //强制使用id作为name值
            var useId = self.get('useId');
            var name;
            if(useId){
                name = $el.attr('id') || $el.attr('name') || guid;
            }else{
                name = $el.attr('name') || $el.attr('id') || guid;
            }
            return name;
        },
        /**
         * 获取Field的目标元素
         * @param fieldName 字段名称
         * @return {*}
         */
        fieldTarget:function(fieldName){
            if(!fieldName) return false;
            var self = this;
            var field = self.field(fieldName);
            if(!field) return false;
            return field.get('target');
        },
        /**
         * getField的别名方法
         * @param name
         * @return {}
         */
        field:function(name){
            return this.getField(name);
        },
        /**
         * 根据key返回field对象
         * @param name
         * @return {Field}
         */
        getField:function (name) {
            return this._storages[name];
        },
        /**
         * 注册验证规则，当name为object时，批量添加
         * @param {String|Object} name
         * @param rule
         */
        register:function (name, rule) {
            Factory.register(name, rule);
            return this;
        },
        /**
         * 触发所有表单元素的验证，validate的别名方法
         * @param fields
         * @return {*}
         */
        test:function(fields){
            return this.validate(fields);
        },
        /**
         * 验证
         * 1.5 [+] 支持指定field验证
         * @param fields
         * @return {Function|Promise.promise}
         */
        validate:function (fields) {
            var self = this;
            var stopOnError = self.get('stopOnError');
            var _defer = Auth._defer;
            //获取需要验证的字段
            fields = self._filterFields(fields);
            //不存在需要验证的规则，直接投递成功消息
            if(!fields.length){
                var _emptyDefer = new Promise.Defer();
                var _emptyPromise = _emptyDefer.promise;
                _emptyPromise.then(function(){
                    _defer.resolve(fields);
                    self.fire('success',{fields:fields});
                })
                _emptyDefer.resolve();
                return _emptyPromise;
            }
            var i = 0;
            var PROMISE;
            var errorFields = [];
            self.fire('beforeTest',{fields:fields});
            _testField(fields[i]);
            function _testField(field){
                if(i >= fields.length) return PROMISE;
                PROMISE =  field.test();
                i++;
                PROMISE.then(function(){
                    //单个field验证成功，继续验证下一个field
                    _testField(fields[i]);
                }).fail(function(rule){
                    //field验证失败
                    //如果配置了stopOnError，将停止下一个Field的验证
                    if(!stopOnError){
                        _testField(fields[i]);
                    }
                    errorFields.push(rule.get('field'));
                })
            }
            //最后一个Field的PROMISE（说明所有的Field都验证了一遍）
            PROMISE.then(function(){
                if(!errorFields.length){
                    //所有filed验证通过
                    _defer.resolve(fields);
                    self.fire('success',{fields:fields});
                }
            }).fail(function(){
                //有一个Field验证失败，就可以派发auth的失败事件
                _defer.reject(errorFields);
                self.fire('error',{fields:errorFields});
            });
            return _defer.promise;
        },
        /**
         * 过滤field数组，去掉不需要验证的数组
         */
        _filterFields:function(fields){
            var self = this;
            var allFields = self.get('fields');
            //用户指定了需要验证的字段
            if(fields){
                var names = fields.split(',');
                if(names.length > 0){
                    fields = S.filter(allFields,function(field){
                        return S.inArray(field.get("name"),names);
                    })
                }
            }else{
                fields = allFields;
            }
            return S.filter(fields,function(filed){
                var rules = filed.get('rules');
                return !S.isEmptyObject(rules);
            })
        }
    }, {
        ATTRS:{
            /**
             * 表单元素
             */
            target:{
                value:"",
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 表单支持的所有验证规则
             */
            rules:{
                value:{},
                getter:function(v){
                    return Factory.rules;
                }
            },
            /**
             * 所有的字段
             */
            fields:{
                value:[],
                getter:function(v){
                    var self = this;
                    var storages = self._storages;
                    var fields = [];
                    S.each(storages,function(field){
                        fields.push(field);
                    });
                    return fields;
                }
            },
            /**
             * 强制使用元素的id作为字段标识
             */
            useId:{ value: false },
            /**
             * 是否自动给表单元素绑定事件
             */
            autoBind:{value:true},
            /**
             * 当发生错误时，是否停止下面的验证
             */
            stopOnError:{value:false},
            /**
             * 提交表单前先触发验证
             */
            submitTest:{value:true}
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
 * v1.5 by 明河
 *  - 增加validate的同名方法test
 *  - 继承promise，支持链式调用
 *  - 异步验证支持
 *  - 增加msg配置
 *  - 过滤不需要的标签
 *  - 增加submitTest配置
 *  - 增加fieldTarget方法
 *  - 增加field方法
 * */
/**
 * @fileoverview Form Auth For Kissy
 * @author zhangting@taobao.com<zhangting@taobao.com>
 * @module auth
 **/
KISSY.add('gallery/auth/1.5/index',function (S, Auth) {
    return Auth;
}, {requires:['./lib/index']});


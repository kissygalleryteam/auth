/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, Event, Base, DOM,Node,Promise, Factory, Rule, Utils) {
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
            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    self._createRule(name,ruleCfg);
                }
            });
            $target.data(DATA_FIELD,self);
            var target = $target.getDOMNode();
            self._targetBind(_cfg.event || Utils.getEvent(target));
            self.fire('render');
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
                S.log(self.get('name')+'字段出错的规则是：'+rule.get('name'));
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
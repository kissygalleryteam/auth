/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, Node,JSON, Base,Promise, Field, Factory, Utils) {
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
            var forms = $form.getDOMNode().elements;
            if(!forms.length) return self;

            var autoBind = self.get('autoBind');
            S.each(forms, function (el) {
                var $el = $(el);
                //过滤不需要验证的表单元素
                var filterTag = ['BUTTON'];
                var tagName = el.tagName;
                if(S.inArray(tagName,filterTag)) return true;
                if(tagName == 'SELECT') $el.attr('type', 'select');
                //如果是一组表单元素像radio，不需要多次实例化Field
                var groupEls = ['radio','checkbox'];
                if(S.inArray($el.attr('type'),groupEls)){
                    if($el.data(DATA_FIELD)) return true;
                }
                //给Filed传递默认参数
                var filedConfig = {
                    //绑定的验证事件
                    event:autoBind ? Utils.getEvent(el) : '',
                    host: self
                };
                var field = new Field(el, filedConfig);
                self.add(field);
            });

            //如果是form模式，需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            $form.attr('novalidate', 'novalidate');

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
                el = S.one(field);
                if(!el.length) return false;

                key = self.getName(el);
                authField = self._storages[key] = new Field(el, config);
            }

            return authField;
        },
        /**
         * 获取元素的id，获取不到，获取name
         * @param $el
         * @return {String}
         */
        getName:function ($el) {
            if (!$el || !$el.length) return '';
            return $el.attr('id') || $el.attr('name') || Utils.guid();
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
         * @param group
         * @return {*}
         */
        test:function(group){
            return this.validate(group);
        },
        /**
         * 验证
         * 1.5 [+] 支持指定field验证
         * @param fields
         * @return {Function|Promise.promise}
         */
        validate:function (fields) {
            var self = this;

            self.fire('beforeTest');

            var result = true, currentField;
            var storages = self._storages;
            var stopOnError = self.get('stopOnError');
            var _defer = Auth._defer;
            /*
             S.each(fields, function (field, idx) {
             var r = field.validate();
             result = result && r;
             currentField = field;

             //stop on error
             if (self.AuthConfig.stopOnError && !result) {
             return false;
             }
             });*/
            var fields = [];
            S.each(storages,function(field){
                fields.push(field);
            })
            var i = 0;
            var PROMISE;
            _testField(fields[i]);
            function _testField(field){
                if(i >= fields.length) return PROMISE;
                PROMISE =  field.test();
                i++;
                PROMISE.then(function(){
                    //单个field验证成功，继续验证下一个field
                    _testField(fields[i]);
                }).fail(function(){
                        //field验证失败
                        //如果配置了stopOnError，将停止下一个Field的验证
                        if(!stopOnError){
                            _testField(fields[i]);
                        }
                    })
            }

            PROMISE.then(function(){
                //所有filed验证通过
                _defer.resolve(fields);
                self.fire('success',{fields:fields});
            }).fail(function(rule){
                    //验证失败
                    _defer.reject(rule);
                    self.fire('error',{rule:rule,field:rule.get('field')});
                });

            self.set('result', result);
            return _defer.promise;
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
             * 是否自动给表单元素绑定事件
             */
            autoBind:{value:true},
            /**
             * 当发生错误时，是否停止下面的验证
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
 * v1.5 by 明河
 *  - 增加validate的同名方法test
 *  - 继承promise，支持链式调用
 *  - 异步验证支持
 *  - 增加msg配置
 *  - 过滤不需要的标签
 * */
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
                if(tagName == 'SELECT') $el.attr('type', 'select');
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
         * 获取元素的name，获取不到，获取id
         * @param $el
         * @return {String}
         */
        getName:function ($el) {
            var self = this;
            var name = Utils.guid();
            if (!$el || !$el.length) return name;
            //强制使用id作为name值
            var useId = self.get('useId');
            var id = $el.attr('id');
            name =  $el.attr('name') || id;
            if(useId) name = id;
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
            self.fire('beforeTest');
            var stopOnError = self.get('stopOnError');
            var _defer = Auth._defer;
            //获取需要验证的字段
            fields = self._filterFields(fields);
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
/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, JSON, Base, Field, Factory, Utils) {

    /**
     * 默认配置
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
     * @class Auth组件入口，表明
     * @version 1.2
     * @param el {selector|htmlElement} form元素
     * @param config {object}
     * @return Auth
     * @constructor
     */
    var Auth = function (el, config) {
        var form = S.get(el);
        var self = this;

        self._storages = {};

        config = S.merge(defaultConfig, config);
        self.AuthConfig = config;

        if(form){
            self.mode = AUTH_MODE.FORM;
            self._init(form, config);
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

            //如果是form模式，需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            if (self.mode === AUTH_MODE.FORM) {
                S.one(el).attr('novalidate', 'novalidate');
            }

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
                el = field.get('el');
                key = self.getName(el);
                authField = self._storages[key || Utils.guid()] = field;
            } else {
                el = S.one(field);
                if(!el.length) return false;

                key = self.getName(el);
                var filedConfig  = self.mergeConfig(el,config);
                authField = self._storages[key] = new Field(el, filedConfig);
            }

            return authField;
        },
        /**
         * 合并表单域的验证配置
         * @param {HTMLElement} el
         * @param {Object} config 配置
         * @return {Object|Boolean}
         */
        mergeConfig:function(el,config){
            if(!el || !el.length) return false;
            var self = this;
            var filedConfig = S.merge(self.AuthConfig, {event:self.AuthConfig.autoBind ? Utils.getEvent(el) : 'none'}, config);
            var rules  = self.getFieldAttrRules(el);
            //合并自定义规则配置
            if(!S.isEmptyObject(rules)){
                filedConfig.rules = S.merge(rules, filedConfig.rules);
            }
            return filedConfig;
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
         * 从html元素的属性中拉取规则配置
         * @param {NodeList} $field 表单域元素
         * @return {Object} rules
         */
        getFieldAttrRules:function ($field) {
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
        },
        /**
         * 根据key返回field对象
         * @param name
         * @return {*}
         */
        getField:function (name) {
            return this._storages[name];
        },
        /**
         * 对Auth注册一个新的规则，当前上下文可用
         * @param name
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
 * changelog
 * v1.5 by 明河
 *  -增加validate的同名方法test
 *
 * */
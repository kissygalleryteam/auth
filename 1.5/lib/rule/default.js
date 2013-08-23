/**
 * @fileoverview 默认规则
 * @author 明河 <minghe36@gmail.com>
 *
 */
KISSY.add(function (S) {
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
            if(S.isArray(value)) {
                return value.length>0;
            }
            this.msg('error','不可以为空！');
            return !!value;
        },
        /**
         * 使用正则直接匹配
         */
        pattern:function (value,attr,defer,field) {
            return new RegExp(attr).test(value);
        },
        /**
         * 最大值验证
         */
        max:function (value,attr,defer,field) {
            if (!S.isNumber(value)) {
                return false;
            }
            this.msg('error','必须小于'+attr);
            return value <= attr;
        },
        /**
         * 最小值验证
         */
        min:function (value,attr,defer,field) {
            if (!S.isNumber(value)) {
                return false;
            }
            this.msg('error','必须大于'+attr);
            return value >= attr;
        },
        /**
         * 最大值验证
         */
        step:function (value,attr,defer,field) {
            if (!S.isNumber(value)) {
                return false;
            }
            if(value == 0 || attr == 1) return true;

            return value % attr;
        },
        /**
         * 校验值是否等于属性配置的值
         */
        equalTo:function(value,attr,defer,field){
            //number same
            if (S.isNumber(value)) {
                return attr === value;
            }

            //selector same
            if(S.one(attr)) {
                return S.one(attr).val() === value;
            }

            //string same
            return attr === value;
        }
    };

});
/**
 * @fileoverview 默认规则
 * @author 明河 <minghe36@gmail.com>
 *
 */
KISSY.add(function (S) {
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
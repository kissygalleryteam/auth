/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add(function (S, DOM, undefined) {
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
         * 根据元素类型来绑定默认的事件
         * @param els
         * @return {string}
         */
        getEvent: function(els){
            var event = 'blur';
            var  type = DOM.attr(els, 'type');
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
 * v1.5 by 明河
 *  - select增加type属性，默认触发事件为change
 * */
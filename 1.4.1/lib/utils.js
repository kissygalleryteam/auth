﻿/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/auth/1.4.1/lib/utils', function (S, DOM, undefined) {

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
        },
        getKeys: function(arr) {
            var keys = [];
            for (var key in arr) {
                keys.push(key);
            }
            return keys;
        }
    };

    return Utils;
},{
    requires:[
        'dom'
    ]
});
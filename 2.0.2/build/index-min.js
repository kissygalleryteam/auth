/*!build time : 2015-01-15 5:02:58 PM*/
KISSY.add("kg/auth/2.0.1/lib/rule/rule",function(a,b,c){function d(b,c,e){var f=this;return a.isString(b)&&a.isFunction(c)?(a.isObject(e)||(e={args:[]}),a.mix(e,{name:b,validation:c}),void d.superclass.constructor.call(f,e)):f}return a.extend(d,b,{validate:function(){var b=this,c=b.get("validation"),d=b._getArgs(),e=b.get("_defer"),f=c.apply(b,d);if(a.isBoolean(f)){var g=f;return f=e.promise,e[g&&"resolve"||"reject"](b),f}return f},msg:function(b,c){var d=this;if(!a.isString(b)&&!a.isString(c))return d;var e=d.get("msg");return c?(e[b]=c,c):e[b]},_getArgs:function(){var a=this,b=new c.Defer,d=a.get("field"),e=[a.get("value"),a.get("propertyValue"),b,d];return a.set("_defer",b),e}},{ATTRS:{name:{value:""},value:{value:"",getter:function(a){var b=this.get("target");return b.length?b.val():a}},propertyValue:{value:"",getter:function(a){var b=this.get("target");return b.length?b.attr(this.get("name")):a}},msg:{value:{error:"",success:""}},validation:{value:function(){}},target:{value:""},field:{value:""},_defer:{value:""}}}),d},{requires:["base","promise"]}),KISSY.add("kg/auth/2.0.1/lib/rule/default",function(a){return{required:function(b){this.msg("error")||this.msg("error","\u4e0d\u53ef\u4ee5\u4e3a\u7a7a\uff01");var c=this.get("target"),d=["radio","checkbox"];if(a.inArray(c.attr("type"),d)){var e=!1;return c.each(function(a){return a.prop("checked")?(e=!0,!1):void 0}),e}return!!a.trim(b)},pattern:function(a,b){return this.msg("error")||this.msg("error","\u4e0d\u7b26\u5408\u8981\u6c42"),""==a?!0:new RegExp(b).test(a)},number:function(b){return this.msg("error")||this.msg("error","\u5fc5\u987b\u662f\u6570\u5b57"),""==b?!0:/^([+-]?)\d*\.?\d+$/.test(a.trim(b))},max:function(a,b){if(this.msg("error")||this.msg("error","\u5fc5\u987b\u5c0f\u4e8e"+b),""==a)return!0;var c=this.get("target");return"checkbox"==c.attr("type")&&(a=0,c.each(function(b){b.prop("checked")&&a++}),this.msg("error")||this.msg("error","\u6700\u591a\u53ea\u80fd\u9009\u62e9"+b+"\u9879")),Number(a)<=Number(b)},min:function(a,b){if(this.msg("error")||this.msg("error","\u5fc5\u987b\u5927\u4e8e"+b),""==a)return!0;var c=this.get("target");return"checkbox"==c.attr("type")&&(a=0,c.each(function(b){b.prop("checked")&&a++}),this.msg("error")||this.msg("error","\u81f3\u5c11\u9009\u62e9"+b+"\u9879")),Number(a)>Number(b)},equal:function(b,c){return this.msg("error")||this.msg("error","\u503c\u5fc5\u987b\u7b49\u4e8e"+c),""==b?!0:a.trim(c)===a.trim(b)},"equal-field":function(b,c){if(this.msg("error")||this.msg("error","\u4e8c\u4e2a\u5b57\u6bb5\u503c\u5fc5\u987b\u76f8\u540c\uff01"),""==b)return!0;var d=this.get("field"),e=d.get("host");if(!e)return!0;var f=e.getField(c);if(!f)return!0;var g=f.get("target").val();return a.trim(g)===a.trim(b)},email:function(b){return this.msg("error")||this.msg("error","\u90ae\u7bb1\u683c\u5f0f\u4e0d\u5408\u6cd5"),""==b?!0:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(a.trim(b))},mobile:function(b){return this.msg("error")||this.msg("error","\u624b\u673a\u53f7\u7801\u683c\u5f0f\u4e0d\u5408\u6cd5"),""==b?!0:/^0?\d{9,11}$/.test(a.trim(b))},date:function(b){return this.msg("error")||this.msg("error","\u65e5\u671f\u683c\u5f0f\u4e0d\u5408\u6cd5"),""==b?!0:/^(?:(?!0000)[0-9]{4}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))$/.test(a.trim(b))}}}),KISSY.add("kg/auth/2.0.1/lib/rule/ruleFactory",function(a,b,c,d,e){var f=function(){var a=this;f.superclass.constructor.call(a)};return f.rules={},a.mix(f.rules,e),a.mix(f,{register:function(b,c){a.isObject(b)?a.mix(f.rules,b):f.rules[b]=c},create:function(a,b){return new d(a,f.rules[a],b)}}),f},{requires:["node","base","./rule","./default"]}),KISSY.add("kg/auth/2.0.1/lib/utils",function(S,DOM,undefined){var Utils={toJSON:function(cfg){cfg=cfg.replace(/'/g,'"');try{eval("cfg="+cfg)}catch(e){S.log("data-valid json is invalid")}return cfg},guid:function(){return"AUTH_"+S.guid()},getEvent:function(a){var b="blur",c=DOM.attr(a,"type")||DOM.attr(a,"data-type");switch(c){case"select":b="change";break;case"select-multiple":case"radio":b="click change";break;case"checkbox":b="click change";break;default:b="blur"}return b},getValue:function(a){var b=[],c=DOM.attr(a,"type");switch(c){case"select-multiple":S.each(a.options,function(a){a.selected&&b.push(a.value)});break;case"radio":case"checkbox":S.each(a,function(a){a.checked&&b.push(a.value)});break;default:b=DOM.val(a)}return b}};return Utils},{requires:["dom"]}),KISSY.add("kg/auth/2.0.1/lib/field/field",function(a,b,c,d,e,f,g,h,i){function j(b){var c=g.rules,d={},e=b.attr("test-rules");if(e){var f={};a.each(e.split(","),function(a){c[a]&&(f[a]=c[a])}),c=f}return a.each(c,function(a,c){b.hasAttr(c)&&(d[c]={msg:{error:b.attr(c+"-msg"),success:b.attr(c+"-success-msg")||n,warn:b.attr(c+"-warn-msg")||n},propertyValue:b.attr(c)})}),d}function k(b){var c={};if(b=m(b),!b||!b.length)return c;var d=j(b);a.isEmptyObject(d)||(c.rules=d);var e=b.attr("auth-event");return e&&(c.event=e),c}function l(b,c){var d=this;d._validateDone={},d._cache={};var e=k(b);return c=a.merge(p,c,e),d._cfg=c,a.mix(c,{target:b}),d._storage={},l.superclass.constructor.call(d,c),d._init()}var m=e.all,n="",o="data-field",p={event:"blur",style:{success:"ok",error:"error"}};return a.mix(l,{_defer:new f.Defer}),a.extend(l,c,{_init:function(){var b=this,c=b._cfg,d=b.get("target"),e=a.merge({},c.rules);b._groupTarget(),a.each(e,function(a,c){!b._storage[c]&&g.rules[c]&&b._createRule(c,a)}),d.data(o,b);var f=d.getDOMNode();return b._targetBind(c.event||i.getEvent(f)),b.fire("render"),b},_groupTarget:function(){var b=this,c=b.get("target");if(a.inArray(c.attr("type"),["checkbox","radio"])){var d=c.getDOMNode().form,e=c.attr("name"),f=[];a.each(document.getElementsByName(e),function(a){a.form==d&&f.push(a)}),c=m(f),b.set("target",c)}return c},_targetBind:function(b){var c=this,d=c.get("target");return d.length?(d.on(b,function(){a.later(function(){c.validate()})}),c):!1},_createRule:function(b,c){var d=this,e=d.get("target");a.mix(c,{value:e.val(),target:e,field:d});var f=g.create(b,c);return d.add(b,f),f},add:function(b,c){var d=this,e=d._storage;return c instanceof h?e[b]=c:a.isFunction(c)&&(e[b]=new h(b,c)),d.set("rules",e),d},remove:function(a){var b=this._storage;return delete b[a],self.set("rules",b),this},rule:function(a){var b=this,c=b.get("rules");return c[a]},test:function(a){return this.validate(a)},validate:function(b){var c=this,d=[],e=c.get("rules");if(a.isString(b)){var g=b.split(",");a.each(g,function(a){e[a]&&d.push(e[a])})}else a.each(e,function(a){d.push(a)});var h=c.get("exclude");if(""!=h){var i=h.split(",");d=a.filter(d,function(b){return!a.inArray(b.get("name"),i)})}if(!c.get("hiddenTest")){var j=c.get("target");j.attr("disabled")&&(d=[])}var k=new f.Defer;if(!d.length){var l=new f.Defer,m=l.promise;return m.then(function(){k.resolve(d),c.fire("success",{rules:d})}),l.resolve(),m}c.fire("beforeTest",{rules:d});var n=new f.Defer;n.resolve(!0);var o=n.promise;return a.each(d,function(a){o=o.then(function(){return a.validate()})}),o.then(function(){k.resolve(d),c.fire("success",{rules:d})}).fail(function(b){k.reject(b),a.log(c.get("name")+"\u5b57\u6bb5\u51fa\u9519\u7684\u89c4\u5219\u662f\uff1a"+b.get("name")),c.fire("error",{rule:b})}),k.promise}},{ATTRS:{target:{value:"",getter:function(a){return m(a)},setter:function(b){var c=m(b),d=this,e=d.get("rules");return a.isEmptyObject(e)||(a.each(e,function(a){a.set&&a.set("target",c)}),c.data(o,d)),c}},name:{value:""},event:{value:"",setter:function(a){var b=this;return b._targetBind(a),a}},host:{value:""},exclude:{value:""},rules:{value:{}},msg:{value:""}}}),l},{requires:["event","base","dom","node","promise","../rule/ruleFactory","../rule/rule","../utils"]}),KISSY.add("kg/auth/2.0.1/index",function(a,b,c,d,e,f,g,h){var i=b.all,j="data-field",k=function(b,c){var d=this;return c||(c={}),b&&a.mix(c,{target:b}),d._storages={},d.AuthConfig=c,k.superclass.constructor.call(d,c),d};return a.mix(k,{_defer:new e.Defer}),a.extend(k,d,{render:function(){var b=this,c=b.get("target");if(!c.length)return b;var d=c.getDOMNode().elements;if(!d.length)return b;var e=b.get("fnFilter");return a.each(d,function(c){var d=i(c);if(a.isFunction(e)&&e.call(b,d))return!0;var f=d.attr("type"),g=["BUTTON"],h=c.tagName;if(a.inArray(h,g))return!0;if("submit"==f)return!0;"SELECT"==h&&d.attr("data-type","select");var k=["radio","checkbox"];return a.inArray(f,k)&&d.data(j)?!0:void b.add(c)}),c.attr("novalidate","novalidate"),b._submit(),b.fire("render"),b},_submit:function(){var a=this,b=a.get("submitTest");if(!b)return a;var c=a.get("target");return c.on("submit",function(b){b.preventDefault(),a.test()}),a.on("success",function(){c.getDOMNode().submit()}),a},add:function(b,c){var d,e,g=this,j="";if(b instanceof f)d=b.get("target"),e=g.getName(d),j=g._storages[e||h.guid()]=b;else{var k=g.get("autoBind");if(d=i(b),!d.length)return!1;e=g.getName(d);var l={event:k?h.getEvent(d):"",host:g,name:e};a.mix(l,c);var m=g.get("fnConfig");a.isFunction(m)&&(l=m.call(g,l,d)),j=g._storages[e]=new f(d,l)}return g.fire("add",{field:j}),j},remove:function(b){var c=this;return b?c._storages[b]?(delete c._storages[b],a.log("\u5220\u9664"+b+" field"),c):void 0:c},getName:function(a){if(!a||!a.length)return"";var b,c=this,d=h.guid(),e=c.get("useId");return b=e?a.attr("id")||a.attr("name")||d:a.attr("name")||a.attr("id")||d},fieldTarget:function(a){if(!a)return!1;var b=this,c=b.field(a);return c?c.get("target"):!1},field:function(a){return this.getField(a)},getField:function(a){return this._storages[a]},register:function(a,b){return g.register(a,b),this},test:function(a){return this.validate(a)},validate:function(a){function b(a){return k>=g.length?(j.then(function(){l.length||(f.resolve(g),c.fire("success",{fields:g}))}).fail(function(){f.reject(l),c.fire("error",{fields:l})}),j):(j=a.test(),k++,void j.then(function(){b(g[k])}).fail(function(a){l.push(a.get("field")),d?f.reject(l):b(g[k])}))}var c=this,d=c.get("stopOnError"),f=new e.Defer,g=c._filterFields(a);if(!g.length){var h=new e.Defer,i=h.promise;return i.then(function(){f.resolve(g),c.fire("success",{fields:g})}),h.resolve(),i}var j,k=0,l=[];return c.fire("beforeTest",{fields:g}),b(g[k]),f.promise},_filterFields:function(b){var c=this,d=c.get("fields");if(b){var e=b.split(",");e.length>0&&(b=a.filter(d,function(b){return a.inArray(b.get("name"),e)}))}else b=d;return b=a.filter(b,function(b){var c=b.get("rules");return!a.isEmptyObject(c)})}},{ATTRS:{target:{value:"",getter:function(a){return i(a)}},rules:{value:{},getter:function(){return g.rules}},fields:{value:[],getter:function(){var b=this,c=b._storages,d=[];return a.each(c,function(a){d.push(a)}),d}},fnFilter:{value:""},fnConfig:{value:""},useId:{value:!1},autoBind:{value:!0},stopOnError:{value:!1},submitTest:{value:!0}}}),a.mix(k,{Field:f}),k},{requires:["node","json","base","promise","./lib/field/field","./lib/rule/ruleFactory","./lib/utils"]});
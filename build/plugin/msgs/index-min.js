/*!build time : 2015-02-11 2:54:52 PM*/
KISSY.add("kg/auth/2.0.6/plugin/msgs/msg",function(a,b,c,d){function e(a){var b=this;a||(a={}),e.superclass.constructor.call(b,a)}var f=c.all,g=".auth-msg";return a.extend(e,b,{render:function(){var a=this,b=a.get("target");if(!b.length)return!1;var c=a._getWrapper();a.set("wrapper",c);var d=a.get("isExist");d||c.hide();var e=a.get("host");e.on("error",function(b){var c=b.rule,d=c.msg("error"),e="error";a.show(e,d)}),e.on("success",function(b){var c=b.target,d=c.get("target"),e=d.attr("success-msg");e?(style=b.style||"success",a.show(style,e)):a.hide()})},hide:function(){var b=this,c=b.get("wrapper");a.buffer(function(){c.slideUp(b.get("speed"))},50)()},show:function(b,c){var d=this;if(!a.isString(b)||!a.isString(c))return d;var e=d.get("wrapper");a.buffer(function(){var a={style:b,msg:c};d._create(a),e.slideDown(d.get("speed"))},50)()},_create:function(a){var b=this,c=b.get("tpl"),e=b.get("wrapper"),f=new d(c).render(a);return e.html(f)},_getWrapper:function(){var a=this,b=a.get("wrapper"),c=a.get("target");if(!c.length)return a;if(!b.length){var d=c.attr("msg-wrapper");d&&(b=f(d))}if(!b.length){if(c.length>1){c=c.item(c.length-1);var e=f(c.parent());(e.hasClass("radio")||e.hasClass("checkbox"))&&(c=c.parent())}var e=f(c.parent());b=f('<div class="msg-wrapper"></div>').appendTo(e)}return b}},{ATTRS:{host:{value:""},target:{value:"",getter:function(a){return f(a)}},tpl:{value:'<p class="auth-msg auth-{{style}}">{{msg}}</p>'},wrapper:{value:"",getter:function(a){return f(a)}},isExist:{value:!1,getter:function(){var a=this,b=a.get("wrapper");return b.length?b.all(g).length:!1}},speed:{value:.3}}}),e},{requires:["base","node","xtemplate"]}),KISSY.add("kg/auth/2.0.6/plugin/msgs/index",function(a,b,c,d){return c.extend({pluginInitializer:function(a){var b=this;return a?(b.set("auth",a),void a.on("add",function(a){var c=a.field;b._renderMsg(c)})):!1},_renderMsg:function(b){if(!b)return!1;var c,e=this,f=b.get("target"),g=e.get("fnWrapper");a.isFunction(g)&&(c=g.call(b,f));var h=new d({tpl:e.get("tpl"),wrapper:c});return h.set("target",f),h.set("host",b),h.render(),b.set("msg",h),h},getMsg:function(a){var b=this,c=b.get("auth"),d=c.getField(a);return d.get("msg")}},{ATTRS:{pluginId:{value:"msgs"},auth:{value:""},tpl:{value:'<p class="auth-msg auth-{{style}}">{{msg}}</p>'},fnWrapper:{value:function(){}}}})},{requires:["node","base","./msg"]});
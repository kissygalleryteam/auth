/*
combined files : 

gallery/auth/1.6/plugin/msgs/msg
gallery/auth/1.6/plugin/msgs/index

*/
KISSY.add('gallery/auth/1.6/plugin/msgs/msg',function (S, Base,Node,XTemplate) {
    var $ = Node.all;
    var MSG_HOOK = '.auth-msg';

    function Msg(config) {
        var self = this;
        if(!config) config = {};
        Msg.superclass.constructor.call(self,config);
    };


    S.extend(Msg, Base, {
        /**
         * 运行
         * @return {boolean}
         */
        render:function () {
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            var $wrapper = self._getWrapper();
            self.set('wrapper',$wrapper);
            var isExist = self.get('isExist');
            if(!isExist) $wrapper.hide();

            var host = self.get('host');
            host.on('error',function(ev){
                var rule = ev.rule;
                var msg = rule.msg('error');
                var style = 'error';
                self.show(style,msg);
            })
            host.on('success',function(ev){
                var field = ev.target;
                var $field = field.get('target');
                var msg = $field.attr('success-msg');
                if(msg){
                    style = ev.style || 'success';
                    self.show(style,msg);
                }else{
                    self.hide();
                }
            })
        },
        /**
         * 隐藏消息层
         */
        hide:function () {
            var self = this;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                $wrapper.slideUp(self.get('speed'));
            }, 50)();
        },
        /**
         * 显示消息层
         * @param status 比如error
         * @param msg 比如用户名不可以为空
         * @return {*}
         */
        show:function (status,msg) {
            var self = this;
            if(!S.isString(status) || !S.isString(msg)) return self;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                var data = {style:status,msg:msg};
                self._create(data);
                $wrapper.slideDown(self.get('speed'));
            }, 50)();
        },
        /**
         * 创建消息层
         * @private
         */
        _create:function(data){
            var self = this;
            var tpl = self.get('tpl');
            var $wrapper = self.get('wrapper');
            var html = new XTemplate(tpl).render(data);
            return $wrapper.html(html);
        },
        /**
         * 获取消息层容器
         * @private
         */
        _getWrapper:function(){
            var self = this;
            var $wrapper = self.get('wrapper');
            var $target = self.get('target');
            if(!$target.length) return self;
            //如果不存在容器
            //取html标签属性上存在消息层配置
            if(!$wrapper.length){
                var wrapperHook = $target.attr('msg-wrapper');
                if(wrapperHook) $wrapper = $(wrapperHook);
            }
            //如果都没有容器，自动创建一个
            if(!$wrapper.length){
                //radio和ckeckedbox的处理比较特殊
                if($target.length > 1){
                    $target = $target.item($target.length-1);
                    var $parent = $($target.parent());
                    if($parent.hasClass('radio') || $parent.hasClass('checkbox')){
                        $target = $target.parent();
                    }
                }
                var $parent = $($target.parent());
                $wrapper = $('<div class="msg-wrapper"></div>').appendTo($parent);
            }
            return $wrapper;
        }
    }, {
        ATTRS:{
            /**
             * 宿主实例，一般是Field实例
             */
            host:{
                value:''
            },
            target:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 消息层模版
             * @type String
             * @default ''
             */
            tpl:{
                value:'<p class="auth-msg auth-{{style}}">{{msg}}</p>'
            },
            /**
             * 消息层容器
             * @type String
             * @default ''
             */
            wrapper:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 验证层是否已经存在
             */
            isExist:{
                value:false,
                getter:function(v){
                    var self = this;
                    var $wrapper = self.get('wrapper');
                    if(!$wrapper.length) return false;
                    return $wrapper.all(MSG_HOOK).length;
                }
            },
            speed:{value:0.3}
        }
    });

    return Msg;

}, {
    requires:[
        'base',
        'node',
        'xtemplate'
    ]
});
/**
 * changelog
 * v1.6 by 明河
 *  -转成插件
 * v1.5 by 明河
 *  -重构消息提示
 *
 * */
KISSY.add('gallery/auth/1.6/plugin/msgs/index',function(S, Node, Base,Msg) {
    //消息集合
    return Base.extend({
        pluginInitializer:function(auth){
            var self = this;
            if(!auth) return false;
            self.set('auth',auth);
            auth.on('render',function(){
                var fields = auth.get('fields');
                S.each(fields,function(field){
                    self._renderMsg(field);
                })
            })
        },
        /**
         * 运行消息实例
         * @private
         */
        _renderMsg : function(field){
            if(!field) return false;
            var self = this;
            var $target = field.get('target');
            var fnWrapper = self.get('fnWrapper');
            var wrapper;
            if(S.isFunction(fnWrapper)){
                wrapper = fnWrapper.call(field,$target);
            }

            var msg = new Msg({
                tpl:self.get('tpl'),
                wrapper:wrapper
            });
            //将Field实例和Field对应的表单元素目标注入到消息配置
            msg.set('target',$target);
            msg.set('host',field);
            msg.render();
            field.set('msg',msg);
            return msg;
        },
        //获取消息实例
        getMsg:function(name){
            var self = this;
            var auth = self.get('auth');
            var field = auth.getField(name);
            return field.get('msg');
        }
    },{
        ATTRS:{
            /**
             * 插件名称
             * @type String
             */
            pluginId:{
                value:'msgs'
            },
            //Auth实例
            auth:{value:''},
            //消息层模版
            tpl:{
                value:'<p class="auth-msg auth-{{style}}">{{msg}}</p>'
            },
            //消息容器函数
            fnWrapper:{value:function(){}}
        }
    });
    return Paste;
}, {requires : ['node','base','./msg']});

/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, Base,Node,XTemplate) {
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
                var msg = ev.msg;
                var style = ev.style;
                if(msg || style){
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
            //html标签属性上存在消息层
            var wrapperHook = $target.attr('msg-wrapper');
            if(wrapperHook) $wrapper = $(wrapperHook);

            if(!$wrapper || !$wrapper.length){
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
 * v1.5 by 明河
 *  -重构消息提示
 *
 * */
/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function (S, Base,Node,XTemplate) {
    var $ = Node.all;
    var MSG_HOOK = '.J_AuthMsg';

    function Msg(target, config) {
        var self = this;
        if(!config) config = {};
        target && S.mix(config,{target:target});
        Msg.superclass.constructor.call(self,config);
        self._init();
    };


    S.extend(Msg, Base, {
        /**
         * init msg
         * @private
         */
        _init:function () {
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            var $wrapper = self._getWrapper();
            $wrapper.hide();
            self.set('wrapper',$wrapper);
        },
        hide:function () {
            var self = this;
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                $wrapper.slideUp(self.get('speed'));
            }, 50)();
        },
        /**
         * 显示消息层
         * @param data
         */
        show:function (data) {
            var self = this;
            var args =self.get('args');
            var tpl = self.get('tpl');
            var $wrapper = self.get('wrapper');
            S.buffer(function () {
                if(!$wrapper.children('.auth-msg').length || data.reCreate){
                    var html = new XTemplate(tpl).render(data);
                    $wrapper.html(html);
                }
                $wrapper.slideDown(self.get('speed'));
            }, 50)();
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
                $wrapper = $target.parent().all(MSG_HOOK);
            }
            return $wrapper;
        }
    }, {
        ATTRS:{
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
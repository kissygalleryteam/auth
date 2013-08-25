##综述

Auth是灵活且强大的表单验证组件，支持异步校验，支持与异步上传组件配合使用。

作者：张挺（V1.4）| 明河（V1.5+）

v1.5还在测试和编写文档中，请先看旧版[v1.4](http://gallery.kissyui.com/auth/1.4/guide/index.html) 。

##demo汇总

<ul>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/simple_form.html">一个简单表单的验证</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/add_custom_rule.html">添加自定义验证规则</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/asyn_test.html">支持异步校验！</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/uploader.html">与异步文件上传组件配合校验！</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/rule_msg.html">规则可以设置默认消息</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/server_msg.html">配合服务器输出的消息</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/rule_msg.html">获取到焦点显示警告信息</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/rule_msg.html">配合uploader使用</a>(1.5+)</li>
    <li><a href="http://gallery.kissyui.com/auth/1.5/demo/rule_msg.html">配合butterfly使用</a>(1.5+)</li>
</ul>

##快速使用

### 引用
    <script src="http://g.tbcdn.cn/kissy/k/1.3.0/kissy-min.js" charset="utf-8"></script>
    <link rel="stylesheet" href="http://g.tbcdn.cn/kissy/k/1.3.0/??css/dpl/base-min.css,css/dpl/forms-min.css,button/assets/dpl-min.css">

使用[kissy dpl的form](http://docs.kissyui.com/1.3/dpl/simpleui/forms.html)结构和样式

### HTML

表单的结构如下：

    <form class="form-horizontal" id="J_Auth">
        <div class="control-group">
            <label class="control-label" for="user">用户名</label>
            <div class="controls">
                <input type="text" class="input-xlarge" name="user" id="user" required>
            </div>
        </div>
        <div class="form-actions">
            <div class="ks-button ks-button-primary ks-button-shown" id="J_TestForm" role="button" aria-disabled="false" tabindex="0" hidefocus="true" aria-pressed="false">提交</div>
        </div>
    </form>

验证的规则配置在元素上（采用的html5的验证配置风格）：

    <input type="text" name="user" required>

特别注意：元素上id可以不存在，但name必须存在！

默认会有验证出错消息，也可以自己配置：

    <input type="text" name="user" required required-msg="用户名不可以为空！">


### 初始化组件

    S.use('gallery/auth/1.5/,gallery/auth/1.5/lib/msg/style.css', function (S, Auth) {
        var auth = new Auth('#J_Auth');
        auth.render();
    })

Auth的第一个参数为form目标元素。

*render()*：必须调用！

*gallery/auth/1.5/lib/msg/style.css* ：为消息层样式，这里使用异步加载，推荐静态引用，地址为：http://gallery.kissyui.com/auth/1.5/lib/msg/style.css

当提交表单前默认会触发验证，验证成功提交表单，想要去掉这个作用，请配置*submitTest:false* 。







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

##默认规则

Auth默认集成了常用的验证规则，直接配置在表单元素的属性上：

规则名 | 用途|用法举例
------------ | -------------| -------------
required | 值必须存在（兼容radio/checkbox/select的处理）| required required-msg="用户名必须存在！"
pattern | 配置一个正则对值进行验证| pattern="s$" pattern-msg="email错误！"
max | 最大值校验（兼容checkbox的处理）| max="3" max-msg="最多选择3项！"
min | 最小值校验（兼容checkbox的处理）| min="3" min-msg="最小选择3项！"
equal | value是否等于配置的值 | equalTo="明河" equalTo-msg="请填写明河！"
equal-field | 校验二个字段的值是否相同 | equal-field="password" equal-field-msg="密码输入不一致！"
number | 是否是数字  | number number-msg="必须是数字"
mobile | 是否符合手机号码格式 | mobile mobile-msg="手机号码不合法！"
email | 是否符合email格式  |
date | 是否符合日期格式 |

##验证消息控制

每个Field对应一个Msg。

请看demo：<a href="http://gallery.kissyui.com/auth/1.5/demo/msg.html" target="_blank">字段上消息的控制</a>。

###指定消息层容器

组件默认会在表单元素后面插入个消息容器：

    <div class="msg-wrapper"></div>

想要自己指定消息层容器，通过配置msg-wrapper属性：

    <input type="text" class="input-xlarge" id="user" msg-wrapper="#J_UseMsg">
    <div id="J_UseMsg"></div>

msg-wrapper的值为容器钩子。

###服务器默认输出了错误消息时的处理

请看demo：<a href="http://gallery.kissyui.com/auth/1.5/demo/server_msg.html" target="_blank">字段上消息的控制</a>。

    <input type="text" class="input-xlarge" id="user" msg-wrapper="#J_UseMsg" >
    <div id="J_UseMsg">
        <!--这里是服务器输出的错误消息 auth-msg样式名必须存在-->
        <p class="auth-msg auth-error">用户名不可以为空！</p>
    </div>

组件会自动处理这种场景，不会出现怪异的二个提示层。

###获取消息实例

    //auth为Auth实例
    //获取name为user的字段
    var userField = auth.field('user');
    //获取消息实例
    var msg = userField.get('msg');


###显示消息

    msg.show('warn','用户名不可以为空！');

生成的层结构：

    <p class="auth-msg auth-warn">用户名不可以为空！</p>

warn变成样式名auth-warn，根据场景可以随意配置。

##修改消息内容

可以手动修改规则对应的消息内容：

    var userField = auth.field('user');
    var requiredRule = userField.rule('required');
    requiredRule.set('error','用户名必须是明河');
    requiredRule.set('success','校验通过');

###隐藏消息

    msg.hide();

###控制动画速度

    msg.set('speed',0.8);

##注册自定义规则

##验证事件绑定控制

##自由控制Field的配置

##异步验证的处理

##与uploader配合使用

##与butterfly配合使用








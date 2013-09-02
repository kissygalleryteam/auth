##综述

Auth是灵活且强大的表单验证组件，支持异步校验，支持与异步上传组件配合使用。

作者：张挺（V1.4）| 明河（V1.5+）

v1.5beta发布，欢迎试用反馈bug~~~

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

请看demo：<a href="http://gallery.kissyui.com/auth/1.5/demo/server_msg.html" target="_blank">配合服务器输出的消息</a>。

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

###修改消息内容

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

[demo传送门](http://gallery.kissyui.com/auth/1.5/demo/add_custom_rule.html)

使用*auth.register(ruleName,function)* 注册一个自定义规则。

*ruleName*: 规则名称
*ruleFunction*: 规则函数，有有二个核心参数，*value*为被验证元素的值，*attr*为html tag中配置的属性值。

    auth.register('min-len', function (value,attr) {
       var min = Number(attr);
       this.msg('error','请您输入至少'+min+'个字符');
       return value.length >= Number(attr);
    });

ruleFunction的this上下文指向对应的Rule实例，比如你要设置rule的错误消息：

    this.msg('error','挺爷，vmarket报错了~');

ruleFunction必须有个返回值，同步校验（区别于异步校验）返回的是Boolean值。

有时你还希望获取到Field实例，调用其*test()*方法：

    var field = this.get('field');

### html tag中的配置

    <input type="text" class="input-xlarge" min-len="5">

您也可以在tag上配置错误消息：*min-len-msg="出错了"*，html上配置的消息会覆盖ruleFunction上配置的error消息。

##异步验证的处理

[demo传送门](http://gallery.kissyui.com/auth/1.5/demo/asyn_test.html)

这是Auth的亮点，与市面上任何一款表单验证组件都不同。

    auth.register('user', function (value,attr,defer,field) {
        var self = this;
        io.get("./user_success.json",'json').then(function(result){
            var data = result[0];
            //用户名
            var name = data.name;
            if(name == 'minghe'){
                //验证成功，传送数据
                defer.resolve(self);
            }else{
                //验证失败，一样传送数据
                defer.reject(self);
            }
        });
        //特别注意：不同于同步校验，这里返回promise
        return defer.promise;
    });

Auth的独特之处在于使用promise模式，保证验证的规则能够排序执行。

*ruleFunction*有第三个参数：*defer* （[Promise.Defer]()的实例），在ruleFunction中，你可以自由的写异步处理逻辑，需要注意的知识二点：

* 返回值必须是*defer.promise*
* 异步加载成功后，如果校验成功调用下*defer.resolve(self)*，校验失败调用下*defer.reject(self)*。

##验证事件

Auth实例的事件

auth.on('success')


##自由控制Field的配置


##与uploader配合使用

如果你的表单包含有[uploader]()异步上传组件，[demo传送门](http://gallery.kissyui.com/auth/1.5/demo/rule_msg.html)。

由于uploader的初始化代码比较多，就不全部贴出来了。

Uploader（异步上传组件），需要个hidden来存储服务器返回的url，Auth进行校验时只要对这个hidden进行校验即可。

Uploader自带了格式、数量等验证，一般只需验证required，有特殊验证需求可以注册个自定义规则。

    <input type="file" class="g-u" id="J_UploaderBtn" value="上传文件" name="Filedata" >
    <input type="hidden" id="J_Urls" name="urls" value="http://test.jpg" required required-msg="必须上传一个文件！"/>

来看个场景：必须上传二个文件

    auth.register('uploader-limit',function(value,attr){
        var limit = Number(attr);
        var queue = uploader.get('queue');
        var count = queue.get('files').length;
        return count == limit;
    })

（ps：uploader为Uploader实例）

验证配置如下：

    <input type="hidden" id="J_Urls" name="urls" value="http://test.jpg" uploader-limit="2" uploader-limit-msg="必须只能上传二个文件！" />

还必须监听Uploader的事件，触发验证。

    uploader.on("success add",function(){
        //触发hidden的验证
        var urlHidden = auth.getField('J_Urls');
        urlHidden.test();
    })


##与butterfly配合使用








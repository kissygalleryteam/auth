##综述

Auth是非常强大的表单校验组件，Auth在灵活性上是无与伦比，足以满足大部分的表单场景。

Auth支持异步校验，支持与异步上传组件配合使用。

作者：张挺（V1.4）| 明河（V1.5+）

##demo汇总

<ul>
    <li><a href="../demo/simple_form.html">一个简单表单的验证</a></li>
    <li><a href="../demo/add_custom_rule.html">添加自定义验证规则</a></li>
    <li><a href="../demo/event.html">事件举例</a>(1.5+)</li>
    <li><a href="../demo/exclude.html">exclude（可以排除验证规则）用法举例</a>(1.5+)</li>
    <li><a href="../demo/asyn_test.html">支持异步校验！</a>(1.5+)</li>
    <li><a href="../demo/uploader.html">与异步文件上传组件配合校验！</a>(1.5+)</li>
    <li><a href="../demo/rule_msg.html">规则可以设置默认消息</a>(1.5+)</li>
    <li><a href="../demo/add_field.html">可以动态添加校验字段</a>(2.0.0+)</li>
    <li><a href="../demo/server_msg.html">配合服务器输出的消息</a>(1.5+)</li>
    <li><a href="../demo/msg.html">字段上消息的控制</a></li>
    <li><a href="../demo/rule_msg.html">给规则设置默认消息</a>(1.5+)</li>
    <li><a href="../demo/noSubmitTest.html">表单提交不默认触发验证</a>(1.5+)</li>
    <li><a href="../demo/rule_msg.html">配合butterfly使用</a>(1.5+)</li>
</ul>

##快速使用

### 引用
    <script src="http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js" charset="utf-8"></script>
        <link rel="stylesheet" href="http://g.tbcdn.cn/kissy/k/1.4.0/??css/dpl/base-min.css,css/dpl/forms-min.css,button/assets/dpl-min.css">

使用[kissy dpl的form](http://docs.kissyui.com/1.4/dpl/simpleui/forms.html)结构和样式

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

    S.use('kg/auth/2.0.3/,kg/auth/2.0.3/plugin/msgs/,kg/auth/2.0.3/plugin/msgs/style.css', function (S, Auth,AuthMsgs) {
        var auth = new Auth('#J_Auth');
        auth.plug(new AuthMsgs());
        auth.render();
    })

Auth的第一个参数为form目标元素。

*render()*：必须调用！

*kg/auth/2.0.3/plugin/msgs/*：消息插件，v2.0.0新增，*auth.plug(new AuthMsgs());*

*kg/auth/2.0.3/plugin/msgs/style.css* ：为消息层样式。

当提交表单前默认会触发验证，验证成功提交表单，想要去掉这个作用，请配置*submitTest:false* 。

v2.0.0新增fnFilter配置，用于过滤不需要实例化的字段：

    var auth = new Auth('#J_Auth',{
        //过滤掉不需要实例化的字段
        fnFilter:function($field){
            return $field.attr('type') == 'hidden';
        }
    });

v2.0.0新增fnConfig配置，用于控制Field的配置：

    var auth = new Auth('#J_Auth',{
        fnConfig:function(filedConfig,$field){
            if($field.attr('type') == 'checkbox'){
                filedConfig.event = 'click change';
            }
            return filedConfig;
        }
    });

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

请看demo：<a href="http://gallery.kissyui.com/auth/2.0.3/demo/msg.html" target="_blank">字段上消息的控制</a>。

###指定消息层容器

组件默认会在表单元素后面插入个消息容器：

    <div class="msg-wrapper"></div>

想要自己指定消息层容器，通过配置msg-wrapper属性：

    <input type="text" class="input-xlarge" id="user" msg-wrapper="#J_UseMsg">
    <div id="J_UseMsg"></div>

msg-wrapper的值为容器钩子。

###服务器默认输出了错误消息时的处理

请看demo：<a href="http://gallery.kissyui.com/auth/2.0.3/demo/server_msg.html" target="_blank">配合服务器输出的消息</a>。

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

[demo传送门](http://gallery.kissyui.com/auth/2.0.3/demo/add_custom_rule.html)

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

[demo传送门](http://gallery.kissyui.com/auth/2.0.3/demo/asyn_test.html)

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

*ruleFunction*有第三个参数：*defer* （[Promise.Defer](http://docs.kissyui.com/docs/html/api/component/promise/defer.html)的实例），在ruleFunction中，你可以自由的写异步处理逻辑，需要注意二点：

* 返回值必须是*defer.promise*
* 异步加载成功后，如果校验成功调用下*defer.resolve(self)*，校验失败调用下*defer.reject(self)*。

## 验证事件

[demo传送门](http://gallery.kissyui.com/auth/2.0.3/demo/event.html)

Auth和Field的验证事件相同，都有：beforeTest（校验前）、success（校验通过）、error（校验失败）事件，但事件的参数有所差异。

先初始化了auth：

    var auth = new Auth('#J_Auth');
    auth.render();

### Auth的*beforeTest*演示

    auth.on('beforeTest',function(ev){
        var fields = ev.fields;
        S.log('验证的字段有：');
        S.log(fields);
    })

*fields*：保存着需要校验的字段数组

### Auth的*success*演示

    auth.on("success",function(){
        S.log('全部验证通过');
    })

参数*fields*：保存着所有触发校验的字段数组

### Auth的*error*演示

    auth.on('error',function(ev){
        var fields = ev.fields;
        S.log('出错的字段是：');
        S.log(fields);
    })

参数*fields*：保存着所有出错的字段数组

### 来看下Field的三个事件

先获取个Field

    var user = auth.getField('user');

留意事件参数值的差异：Field的值为Rule规则实例。

    user.on('beforeTest',function(ev){
        var rules = ev.rules;
        S.log('user字段验证的规则：');
        S.log(rules);
    })
    user.on('success',function(ev){
        var rules = ev.rules;
        S.log('user字段验证成功：');
        S.log(rules);
    })
    user.on('error',function(ev){
        var rule = ev.rule;
        S.log('出错的规则是：');
        S.log(rule);
    })

##Auth API详解

### 属性/配置参数

属性名 | 类型|只读|默认值|说明
------------ | -------------| -------------| -------------| -------------
stopOnError | Boolean|N|false| 设置为true时，当field校验失败时会停止后面field的校验
submitTest | Boolean|N|true| 设置为true时，提交表单前会先触发校验
autoBind | Boolean|Y|true| 设置为true时，生成field时，会自动给表单元素绑定校验事件
useId | Boolean|Y|false| 设置为true时，会优先使用元素的id作为field的那么，默认优先使用name
fields | Array|Y|[]| auth下所有的field
rules | Object|Y|{}| auth支持的所有规则
target | Nodelist|Y|""| auth对应的form元素

### test()：触发校验

    auth.test().then(function(){
        //校验成功后执行
    }).fail(function(){
        //校验失败后执行
    })

跟field一样，支持链式调用then()和fail()方法。

test()支持只校验指定的field。

    auth.test('user,sex');

### register(name, rule)：注册验证规则

    auth.register('max',function(value,attr){
        return true;
    });

当name为object时，批量添加。

    auth.register({
        'max':function(value,attr){
            return true;
        }
    });

### field(name)：根据key返回field对象

    var user = auth.field('user');

### fieldTarget(name):获取Field的目标元素

    var $user = auth.fieldTarget('user');

如果你需要对表单元素进行特殊操作，不需要给元素加个钩子，直接使用这个方法即可。

### add(field, config)：添加一个field

    auth.add("#new_user");

有些表单元素是异步加载的，在auth初始化时并没有添加进去，这时候就需要*add()*手动将field添加到auth中。


##Field字段API详解

### Field所有的属性说明

属性名 | 类型|只读|默认值|说明
------------ | -------------| -------------| -------------| -------------
name | String|Y|""| 字段名称
rules | Object|Y|{}| 字段上绑定的所有规则
rules | Object|Y|{}| 字段上绑定的所有规则
host | Auth|Y|""| Auth的实例
msg | Msg|N|""| 消息实例，可以覆写自定义的消息类实例
exclude | String|N|""| 验证时排除的规则，后面有详细演示
disabledTest | Boolean|N|false|  如果表单元素的disabled时，跳过验证，设置为true时，disabled的元素字段也会触发校验
event | String|N|""|  给元素绑定指定的事件用于触发校验，比如*user.set('event','blur')*
target | NodeList|N|""| target指向Field对应的表单元素，target是可以被改写的


### 通过元素获取Filed实例

    <input type="text" name="user" id="J_User" required>

    var field = KISSY.one('#J_User').data('data-field');

*data-field*：当Field实例化时会把实例缓存到表单元素上。

### 如何不触发字段校验

业务场景：有个input隐藏了，我们不希望触发这个input的校验。

最简单方法：

    <input type="text" name="user" required disabled>

设置input的disabled属性，Auth校验时会自动跳过这个字段。

高端方法：使用exclude属性排除该字段方法

### exclude属性的妙用

    var user = auth.field('user');
    user.set('exclude','required');

校验时，排除required规则，如果要排除多个规则：*user.set('exclude','required,max')*。

不希望排除规则：*user.set('exclude','')*。

### 重写target属性的用法

有时表单元素会移除，或重新渲染，这时候*target*已经不存在了，就需要重写下target属性，不然校验会失败。

    KISSY.one('#user').remove();
    var user = auth.field('user');
    user.set('target',"#new_user");
    S.log(KISSY.one('#new_user').data('data-field'));

### then()与fail()


    user.test().then(function(){
        //校验成功后执行
    }).fail(function(){
        //校验失败后执行
    })


### rule():获取指定规则

    user.rule('max');

### remove():删除指定规则

    user.remove('max');

### test():校验字段上绑定的规则

可以指定校验规则：

    user.test('max,min');

##Rule API详解

业界大部分的规则都是做成了Object配置形式，比如：

    demo.addRule([{
        ele:".inputxt:eq(0)",
        datatype:"zh2-4"
    },
    {
        ele:".inputxt:eq(1)",
        datatype:"*6-20"
    }]);

这种结构化的方式配置起来很简单，但遗憾的是只能满足70%的普通需求，表单的业务场景是非常复杂的，ajax异步校验，加个"callback"字段，如果要适用异步上传的校验呢？如果需要延迟3秒校验呢？再加个字段？

结构化的设计在表单校验中是错误的，低估了表单业务复杂性。

所以Auth使用Function的方式，用户可以在规则函数中写任何校验逻辑，甚至异步校验逻辑，只要保证函数的返回值符合auth要求即可。

比如下面的代码：

    auth.register('later-max',function(value,attr,defer){
        var self = this;
        S.later(function(){
            if(value < attr){
                defer.resolve(self);
            }else{
                defer.reject(self);
            }
        },3000);
        return defer.promise;
    })

比如随意设置错误消息：

    auth.register('min',function(value,attr,defer){
        if(!this.msg('error')) this.msg('error','消息随便设置');
        return Number(value) > 0;
    })

更强大的是，你可以通过rule回溯到Field和Auth。
比如当你校验这个规则时，希望校验另外一个规则：

    auth.register('min',function(value,attr,defer){
        return Number(value) > 0;
    })

    auth.register('len',function(value,attr,defer){
        var field = this.get('field');
        field.test('min');
        return Number(value) > 3;
    })


##与uploader配合使用

如果你的表单包含有[uploader]()异步上传组件，[demo传送门](http://gallery.kissyui.com/auth/2.0.3/demo/rule_msg.html)。

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








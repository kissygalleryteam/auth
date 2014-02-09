##综述

Auth1.4.1是为了那些升级到1.5有困难，但是又需要异步校验等新功能的同学而重新开发的。

Auth1.4.1是1.4的扩充，增加了异步校验势必会使得原有的API发生变化，作者希望这些变化尽可能的小，以便可以方便的升级。

同时，完善了1.4系列的文档，对之前的文档不全本人有非常大的责任，在此抱歉。

此外，auth 1.4支持kissy 1.2+的版本，低版本的用户使用没有障碍，之后代码会更精简，只保留核心校验功能，让表单校验更加的纯粹、简单，多谢各位的支持。

##demo汇总

<ul>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/first.html">一个简单表单的验证</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/msg.html">带message的校验</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/modifyField.html">修改一个已经存在的field</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/async.html">支持异步校验！</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/checkbox.html">checkbox+添加自定义校验！</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/addfield.html">动态添加一个field</a></li>
    <li><a href="http://gallery.kissyui.com/auth/1.4.1/demo/all.html">复杂而全面的校验场景</a></li>
</ul>

##API汇总

**auth初始化参数**

- el {el|htmlElement|String} 表单参数
- config {Object}
    - autoBind {Boolean} 是否自动绑定事件
    - stopOnError {Boolean} 是否当校验碰到错误时停止
    - exclude {Array} 需要排除的表单name数组，用于暂时不进行校验的表单域，一般情况下无需使用，因为即使创建了表单域，如果没有规则，默认的校验结果都是true
    - msg {Object} 消息配置
        - tpl {String} 消息模板，包含style和msg两个默认变量
        - style {Object} 成功和失败的class
            - success {String} 成功的class
            - error {String} 失败的class
    - rules {Object} 规则默认的默认消息配置
        - 规则名 {String|Object} 如果只有失败的消息，可以直接使用字符串，如果有成功和失败两个消息，就写成对象

```js
var auth = new Auth('#J_Auth', {
    "autoBind": true,
    "stopOnError": false,
    "msg": {
        "tpl": '<div class="msg {prefixCls}"><p class="{style}">{msg}</p></div>',
        "style":{
            "success":'attention',
            "error":'error'
        }
    },
    "exclude": [],
    "rules": {
        "required":"此项必填",
        "max": {
            "success": "范围可用",
            "error": "超出最大范围"
        }
    }
});
```

**auth的方法**

- register(ruleName, ruleFn) 注册一个全局规则，每个field都可以用，如果仅仅是一个field需要某规则，直接使用field.add即可
    - ruleName {String} 规则名
    - ruleFn {Function} 规则内容

```js
//注册同步规则
auth.register('card', function (value) {
    return value.length > 3;
});

//注册异步规则
auth.register('name', function(values, done) {
    KISSY.use('ajax, dom',function(S, IO){
        //我随便找了个异步地址
        IO.jsonp('http://suggest.taobao.com/sug', {q:'a'}, function(data){
            //假装失败了
            done(false);
        });
    });
});
```

- field(name) {String} 返回一个已经存在的field，name为field的id或者name
- field(el, config) 添加或者修改一个field
    - el {el|htmlElement|String}
    - config {Object}
        - rules 见auth初始化的rules


- validate(callback) 校验auth里所有的field
    - callback {Function} 有一个result参数，用于取到返回的结果

```js
auth.validate(function(result){
    if(result) {
        //TODO
    } else {
        alert('校验不通过');
    }
});
```

**auth的事件**

- validate 校验事件
    - ev.result {Boolean}
    - lastField {FieldObject} field对象，最后一个校验的field

```js
auth.on('validate', function(ev) {
    console.log(ev.result);
});
```

**auth的属性**

- result {Boolean} 最近一次的校验结果
- cfg {Object} 当前的配置信息

```js
auth.get('result')
auth.get('cfg')
```

##代码变化汇总

- 把propertyRule和Rule统一成了新的Rule对象
- auth的validate方法不再返回校验结果，改成通过回调函数返回
- field的validate方法不返回校验结果，统一使用事件监听的方式
- 去除了field在validate时的参数传递
- rule的规则函数添加最后一个异步参数，但是保留同步返回的方式
- 现在hidden、submit、button、reset等表单将不会触发校验
- 去除了auth、field和rule的“beforeValidate”和“afterValidate”事件
- 去除Auth.Field的暴露接口，直接使用auth.field来创建和修改field
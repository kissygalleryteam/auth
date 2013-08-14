# Auth

原本为KISSY-Form中的校验组件，gallery拆分之后分离出来作为独立组件置于顶层，从1.4版本开始，其实和1.3代码一样。

v1.5 测试中，请勿使用

## changelog

### V1.5 by 明河

    [!] 重构消息类
    [!] 改用get和set来获取/设置属性
    [!] tag config方式更改
    [!] [Field] el配置改成target
    [!] [Field] 修改event配置
    [!] [Field] validate()方法去掉cfg参数，多个规则逗号隔开
    [!] [Rule] 重构
    [!] [ruleFactory] 颠倒规则函数的value和pv
    [!] [ruleFactory] 不再区分html规则和自定义规则
    [!] [Msg] 重构
    [!] [Msg] msg传递方式优化
    [!] 去掉多余无用的样式，使用stylus改写
    [+] 新增render()，不再new时马上初始化逻辑
    [+] 增加validate的同名方法test
    [+] 继承promise
    [+] 异步校验支持
    [+] [Field]增加success、error、beforeTest事件
    [+] [Filed]新增rules属性，用于获取所有的规则
    [+] [Filed]新增exclude配置，用于排除指定规则验证
    [+] [Rule]规则可以设置默认消息
    [+] [Msg]兼容服务器返回的错误信息
    [-] 删除rule/base
    [-] 删除propertyRule

### V1.4

    [!] 从butterfly中迁移到新的gallery
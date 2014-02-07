##综述

Auth1.4.1是为了那些升级到1.5有困难，但是又需要异步校验等新功能的同学而重新开发的。

Auth1.4.1是1.4的扩充，增加了异步校验势必会使得原有的API发生变化，作者希望这些变化尽可能的小，以便可以方便的升级。

同时，完善了1.4系列的文档，对之前的文档不全本人有非常大的责任，在此抱歉。

此外，auth 1.4支持kissy 1.2+的版本，低版本的用户使用没有障碍，之后代码会更精简，只保留核心校验功能，让表单校验更加的纯粹、简单，多谢各位的支持。

##demo汇总

##API汇总

##代码变化汇总

- 把propertyRule和Rule统一成了新的Rule对象
- auth的validate方法不再返回校验结果，改成通过回调函数返回
- field的validate方法不返回校验结果，统一使用事件监听的方式
- 去除了field在validate时的参数传递
- rule的规则函数添加最后一个异步参数，但是保留同步返回的方式
- 现在hidden、submit、button、reset等表单将不会触发校验
- 去除了auth、field和rule的“beforeValidate”和“afterValidate”事件
- 去除auth.add时自动创建field的接口，改为直接add new Auth.Field()，保持Field创建入口统一
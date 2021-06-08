# chk 说明文档

vue 示例:

```html

<div ref="query">
    <kv label="数据库">
        <selector :button-style="true" :data="['mongo','mysql']" v-model="query.db" chk="*" chkmsg="必填项!"></selector>
    </kv>
</div>
```

```js
if (this.$refs.query.chk() == false) {
    return;
}

//验证通过的逻辑
```

## 定义 
在指定 dom 上添加 chk 属性，对每一个chk属性,验证里面的 v-model 绑定表达式值 或 input,textarea 元素的值. 优先使用 v-model值。chk用法：
可以自定义 chkmsg 属性用于校验失败后显示的消息。 如果不定义会有默认消息提示。


### 整体结构

`{value}` `?` `chk_type` `表达式`

#### 结束说明
1. 以 {} 包裹开头，表示对v-model进行求值。
2. 问号开头，表示可空，如果值为空，则直接跳过，不进行任何校验。
3. chk_type 可以是 `:`,`@`, `自定义类型`
4. 表达式是其作部分。
   

### 规则 
1. chk_type 是冒号，表示回调函数，其实部分是表达式式，接收参数：当前值,vue定义的data ,这是最灵活的方式. 函数返回的是错误消息，没有消息表示通过。

> chk=": if( value.length<8 ) return '长度不能小于8'; "

3. 绑定自定义函数，也是很灵活的写法，接收参数：当前值,vue定义的data

> chk="@chk_order_code"  

需要在本 vue 页面写一个  chk_order_code(value){}  的函数。

4. 内置类型写法 目前插件有以下内置类型 int,float,date,time,datetime,email

公式:
> chk_type{值表达式}(开始值,结束值)

```
其中:
chk_type后面跟 问号 表示可空.
开始值,结束值:
 使用 () 表示大于开始值,小于结束值.
 使用 [] 表示大于等于开始值,小于等于结束值.
 
如:
{value.length}(3,5]   //表示字符串类型,长度大于3,小于等于5
int[20,79]            //表示是int类型,大于等于20,小于等于79
{value.length}(3)     //表示字符串类型,长度大于3,不设上限.
```

> chk="int"

5. 枚举写法

```
chk="enum(红,黄,蓝)"
```
或
```
//表示使用 jv.enum.UserSexEnum.getData().map(it=>it.name) 进行校验。
chk="enum:UserSexEnum"
```

6. 正则表达式写法

```
chk="reg{值}:正则表达式"

如:
chk="reg{value.code}:/^\d{9,11}$/"   表示value.code 必须是9到11位数字.
```

7. 扩展类型 如果需要重复使用某一个通用的类型,可以扩展,如下:

```
 jv.chk_types["mobile"] = function(value, inputDom){
    //对value进行验证
    //通过返回 true
    //失败返回 false
 }
 
写法:
chk="mobile{value.length[0]}(1,3]"  //手机号格式,第一位必须是1
```

## 执行

全部执行:

```
if(this.$refs.card.chk() == false){
    return;
}
```

指定检查某一个:

```
if (jv.getVDomFromExpression(this.$refs.card, "query.group").chk_item("*") == false) {
    return;
}
```
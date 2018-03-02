# libjv
Es6的单页应用常用扩展
https://github.com/krasimir/webpack-library-starter

# 验证
```html
<div ref="form">
  <div chk="" chk_msg="">
    <input  />
  </div>
  
  <div chk="" chk_msg="">
    <input  />
  </div>
</div>
```
```js
if (document.querySelector("[ref=form]").chk() == false) {
  return;
}

//验证通过的逻辑
```

## 验证规则: 
* document.querySelector("[ref=form]") 表示要验证的区域.
* 对每一个chk属性,验证里面的 v-model 绑定 或 input,textarea 元素. 优先使用 v-model值.
* chk函数返回 验证是否通过.

## chk验证表达式

* 函数写法,参数:value, inputDom,这是最灵活的方式. 


    value 表示chk元素内部 v-model的值或 input 或 textarea 的value 值.
    inputDom 表示 chk元素内部第一个input或textarea
    函数返回合法的false值,表示验证通过.
    返回的字符串,将以验证失败的样式出现.
    
```
: if( value.length < 3) return '请输入名称';
```

* 正则表达式写法
```
reg{值}:正则表达式

如:
reg{value.code}:/^\d{9,11}$/   表示value.code 必须是9到11位数字.
```

* 枚举写法
```
enum(红,黄,蓝)
```
* 内置类型写法
目前插件有以下内置类型
int,float,date,time,datetime,email
```
公式:
chk_type{值表达式}(开始值,结束值)

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
* 扩展类型
 如果需要重复使用某一个通用的类型,可以扩展,如下:
```
 jv.chk_types["mobile"] = function(chk_body, value, inputDom){
    //对value进行验证
    //通过返回 true
    //失败返回 false
 }
 
写法:
mobile{value[0]}[1]  //手机号格式,第一位必须是1
```

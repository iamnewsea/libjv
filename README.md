# libjv
Es6的单页应用常用扩展
https://github.com/krasimir/webpack-library-starter

# 安装依赖包
> npm i --registry=https://registry.npm.taobao.org

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

集成验证提示
```
    jv._last_error_msg = "";
    jv._last_error_title = "";
    jv.showLastError = function () {
        if (!jv._last_error_msg) return;
        return jv.error(jv._last_error_msg, jv._last_error_title);
    };

    jv.error = function (msg, title, opt) {
        if (opt == "ajax") {
            document.write((title || "") + "<br />" + msg)
            return;
        }

        var msg2 = msg;
        if (title) {
            msg2 = "[" + title + "] " + msg2;
        }

        console.error(msg2);

        jv._last_error_msg = msg;
        jv._last_error_title = title;

        var ret = jv.main.$notify(Object.assign({
            title: title || '错误',
            message: msg,
            type: 'error',
            customClass: "popmsg error_msg"
        }, opt));

        return ret;
    };

    jv.confirm = function (msg, buttons, opt) {
        var msgs = (buttons || "").split(",");
        return jv.main.$confirm(msg, '提示', Object.assign({
            confirmButtonText: msgs[0] || '确定',
            cancelButtonText: msgs[1] || '取消',
            type: 'warning'
        }, opt));
    };

    jv.prompt = function (msg, title, opt) {
        return jv.main.$prompt(msg, title || '提示', Object.assign({
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }, opt));
    };

    jv.chk_clear = function (chk_opt) {
        if (chk_opt && chk_opt.target) {
            chk_opt.target.classList.remove("chk_error");
        } else {
            Array.from(document.body.getElementsByClassName("chk_error")).forEach(it => it.classList.remove("chk_error"));
        }
    };

    jv.chk_error = function (chk_opt) {
        if (!chk_opt || chk_opt.type != "chk") {
            return;
        }

        var msg = chk_opt.msg;
        if (!msg) {
            var kv = chk_opt.target.closest(".kv");
            if (kv) {
                msg = ((kv.getElementsByClassName("k")[0] || {}).textContent || "").trim() + " " + chk_opt.detail;
            }
        }

        // jv.chk_clear();
        chk_opt.target.classList.add("chk_error");
        console.error(msg);
        //只提示第一个
        if (!chk_opt.index) {
            jv.pop_msg(msg, "数据校验失败", "chk");
        }
    };

    jv.pop_msg = function (msg, title, type) {
        var msg2 = msg;
        if (title) {
            msg2 = "[" + title + "] " + "[" + type + "] " + msg2;
        }

        if (type in console) {
            console[type](msg2);
        }

        if (window.vant) {
            return vant.Toast.fail({
                    message: msg,
                    icon: type == "error" ? 'warning-o' : "info-o"
                }
            );
        }

        if (window.ELEMENT) {
            return jv.error(msg, title);
        }

        var p = document.getElementById("_pop_msg_root_");
        if (!p) {
            p = document.createElement("div");
            p.timer_number = 0;
            p.timerId = setInterval(function () {
                if (p.timer_number < 0 && p.timer_number >= 7) {
                    return;
                }

                p.timer_number++;
                if (p.timer_number >= 5) {
                    p.classList.remove("fade_in");
                    p.classList.add("fade_out");
                    return;
                }

            }, 1000);
            p.onmouseenter = function () {
                p.timer_number = -1;
            };
            p.onmouseleave = function () {
                p.timer_number = 0;
            };

            p.id = "_pop_msg_root_";
            p.classList.add("pop_msg");
            p.innerHTML = "<fieldset><legend></legend><div class='msg'></div></fieldset>";
            document.body.appendChild(p);
        }
        p.timer_number = 0;
        p.classList.remove("fade_in", "fade_out");

        p.getElementsByTagName("legend")[0].innerHTML = title;
        p.getElementsByClassName("msg")[0].innerHTML = msg;

        p.classList.add("fade_in");
    };
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

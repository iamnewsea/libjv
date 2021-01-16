# libjv
Es6的单页应用常用扩展
https://github.com/krasimir/webpack-library-starter

## 安装依赖包
> npm i --registry=https://registry.npm.taobao.org

## 发版 
> npm publish

> cnpm sync libjv

 


集成验证提示
```
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
 

# libjv 引用顺序

* defineProperty
* libjv
* vue-chk
* file-upload
* jv-vue
* index


非自有项目中 main.js 配置
```js
import Vue from 'vue';
import axios from 'axios'

window.Server_Host = "http://apis.lwljuyang.cn/api-activity";

axios.interceptors.response.use((response) => {
    //第一个拦截器
    // 转消息机制，底层提醒
    var body = response.data.data;
    if( body && body.resp_msg){
        body.msg = body.resp_msg;
    }
    return response;
});


import jv from "libjv";
import ElementUIExt from 'element-ui-ext'
Vue.use(ElementUIExt);

jv.initVue({vue: Vue, axios: axios, router: router});
jv.ajax.interceptors.request.use(
    config => {
        if (config.url.startsWith("/") && localStorage.getItem('Authorization')) {
            config.headers.Authorization = localStorage.getItem('Authorization');
        }
        return config
    },
    error => {
        // 发送失败
        // console.log(error)
        Promise.reject(error)
    }
);


```
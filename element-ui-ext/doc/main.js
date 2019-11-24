import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import jv from './api/enums.js'
import axios from 'axios'
import ElementUI from 'element-ui'
import ElementUIExt from 'element-ui-ext'
import './element-variables.scss'

Vue.config.productionTip = false

// window.Server_Host = "http://172.16.3.199:8081";
window.Server_Host = "http://59.110.157.64:8130";
//window.Server_Host = "http://localhost:8130";

(function (jv) {
    window.jv = jv;

    jv.initApp(Vue);
    jv.initAxios(axios);
    Vue.config.productionTip = true;

    jv.reset = function () {
    };

    // this.$http.post = Vue.prototype;


    axios.interceptors.response.use(response => response, error => {
        var resp = error.response;
        var status = resp.status;
        if (status == 401) {
            jv.main.loginFromVisible = true;
            return Promise.reject(error);
        }
        return Promise.reject(error);
    });

    /*Vue.config.productionTip = false;*/
    Vue.use(ElementUI);
    Vue.use(ElementUIExt);

    Vue.prototype.$http = axios;


    window.onerror = function (strMsg, url, line) {
        if (strMsg) {
            console.log(strMsg);
        }
    };


    jv.info = function (msg, title) {
        jv.main.$notify({
            title: title || '消息',
            message: msg,
            type: 'success',
            customClass: "popmsg info_msg"
        });
    }

    jv.warn = function (msg, title) {
        jv.main.$notify({
            title: title || '提示',
            message: msg,
            type: 'warning',
            customClass: "popmsg warning_msg"
        });
    }

    jv.error = function (msg, title) {
        if (title) {
            var msg2 = msg;
            if (title) {
                msg2 = "[" + title + "] " + msg2;
            }
            console.error(msg2)
        }
        jv.main.$notify({
            title: title || '错误',
            message: msg,
            type: 'error',
            customClass: "popmsg error_msg"
        });
    }

    jv.confirm = function (msg, messages, callback) {
        if (!callback && (messages.Type == "function")) {
            callback = messages;
            messages = "";
        }

        var msgs = messages.split(",");
        return jv.main.$confirm(msg, '提示', {
            confirmButtonText: msgs[0] || '确定',
            cancelButtonText: msgs[1] || '取消',
            type: 'warning'
        }).then(callback)
    }
})(jv);


var vue = new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

vue.$nextTick(it => {
    jv.main.loadData();
    document.documentElement.classList.add("loaded");
});

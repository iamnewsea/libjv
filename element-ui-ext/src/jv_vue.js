import jv from "libjv"

(function () {
    jv.tabs_key = "$tabs";

    class TabItemData {
        name = ""
        root = ""
        path = ""

        constructor(name, root, path) {
            this.name = name;
            this.root = root;
            this.path = path || root;
        }

        get root_com() {
            return jv.getIframeUrl(this.root);
        }

        get path_com() {
            return jv.getIframeUrl(this.path);
        }
    }

    jv.TabItemData = TabItemData;

    jv.getIframeUrl = function (path) {
        var json = jv.query2Json(BASE_URL.slice(0, -1) + path);
        json["_com_"] = true;
        return jv.param(json, true);
    }

    jv.exit_fullscreen = function () {
        //退出浏览器全屏
        try {
            var exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
            if (exit) {
                exit().catch(e=>{});
            }
        } catch (e) {

        }

        //容器执行的脚本
        var iframe = document.querySelector("iframe.fullscreen");
        if (iframe) {
            iframe.classList.remove("fullscreen");
            document.body.classList.remove("fullscreen")
        }

        // iframe 内执行的脚本
        top.document.body.classList.remove("fullscreen")
        if (window.frameElement) {
            window.frameElement.classList.remove("fullscreen");
        }
    }


    jv.last_msgs = {};
    jv.showLastInfo = function () {
        if (!jv.last_msgs.info) return;
        (top.jv || jv).info.apply(null, jv.last_msgs.info);
    };

    jv.alert = function (msg, title, opt) {
        jv.last_msgs.alert = [msg, title, opt];

        jv.Vue.prototype.$alert(msg, title || "提示", Object.assign({
            type: "info",
            dangerouslyUseHTMLString: true
        }, opt));
    };

    jv.info = function (msg, title, opt) {
        jv.last_msgs.info = [msg, title, opt];

        return jv.Vue.prototype.$notify(Object.assign({
            title: title || '消息',
            message: msg,
            type: 'success',
            customClass: "popmsg info_msg"
        }, opt));
    };

    jv.warn = function (msg, title, opt) {
        jv.last_msgs.warn = [msg, title, opt];
        return jv.Vue.prototype.$notify(Object.assign({
            title: title || '提示',
            message: msg,
            type: 'warning',
            customClass: "popmsg warning_msg"
        }, opt));
    };

    jv.showLastError = function () {
        if (!jv.last_msgs.error) return;
        (top.jv || jv).error.apply(null, jv.last_msgs.error);
    };

    jv.error = function (msg, title, opt) {
        jv.last_msgs.error = [msg, title, opt];

        var msg2 = msg;
        if (title) {
            msg2 = "[" + title + "] " + msg2;
        }
        console.error(msg2);

        var ret = jv.Vue.prototype.$notify(Object.assign({
            title: title || '错误',
            message: msg,
            type: 'error',
            customClass: "popmsg error_msg"
        }, opt));

        return ret;
    };

    jv.confirm = function (msg, buttons, opt) {
        var msgs = (buttons || "").split(",");
        return jv.Vue.prototype.$confirm(msg, '提示', Object.assign({
            confirmButtonText: msgs[0] || '确定',
            cancelButtonText: msgs[1] || '取消',
            type: 'warning'
        }, opt));
    };

    jv.prompt = function (msg, title, opt) {
        return jv.Vue.prototype.$prompt(msg, title || '提示', Object.assign({
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }, opt));
    };

    /* my-list 专用API */
    jv.setLastRowId = function (route, ref, lastRowId) {
        if (!lastRowId) {
            lastRowId = ref;
            ref = "list"; //默认是 list
        }

        var storeId = ref || "list";
        var key = "ext:" + storeId + ":" + route;
        localStorage.patchJson(key, {lastRowId: lastRowId});
    }

})();

export default jv;

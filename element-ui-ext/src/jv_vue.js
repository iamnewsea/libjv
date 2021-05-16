import jv from "libjv"

(function () {
    jv.tabs_key = "$tabs";

    jv.last_msgs = {};
    jv.showLastInfo = function () {
        if (!jv.last_msgs.info) return;
        (top.jv || jv).info.apply(null, jv.last_msgs.info);
    };

    jv.alert = function (msg, title, opt) {
        jv.last_msgs.alert = [msg, title, opt];

        jv.main.$alert(msg, title || "提示", Object.assign({
            type: "info",
            dangerouslyUseHTMLString: true
        }, opt));
    };

    jv.info = function (msg, title, opt) {
        jv.last_msgs.info = [msg, title, opt];

        return jv.main.$notify(Object.assign({
            title: title || '消息',
            message: msg,
            type: 'success',
            customClass: "popmsg info_msg"
        }, opt));
    };

    jv.warn = function (msg, title, opt) {
        jv.last_msgs.warn = [msg, title, opt];
        return jv.main.$notify(Object.assign({
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

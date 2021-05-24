import jv from "./libjv_dom"

/**
 * jv.initVue({vue:Vue,axios:axios,router:router});
 * @param setting
 * @returns {value|boolean|*}
 ajaxJavaBooleanKey ：默认为true , 是否处理 Java Boolean的Key，如：接口返回 admin:true , 转化为： isAdmin: true
 ajaxResType ： 默认为 true , 系统默认对 boolean,date添加 _res 额外键，设置这个字段，会忽略指定的类型。该值是逗号分隔的字符串，有如下值：boolean,date
 ajaxErrorMsg: 默认为 true,系统默认认为 res.data.msg 是错误消息，弹窗提示

 VUE_APP_Server_Host 表示axios服务器主机头
 VUE_APP_User_System 表示用户体系，localStorage用它做前缀。
 */
var initEnvVue = function (vue) {
    jv.Vue = vue;
    var vueProtype = vue.prototype;
    vueProtype.jv = jv;
    vueProtype.$http = axios;

    var envs = process.env;
    window.BASE_URL = envs.BASE_URL;

    // jv.initVue_setting = {ajaxJavaBooleanKey, ajaxResType, ajaxErrorMsg};

    Object.keys(envs).forEach(key => {
        if (key.startsWith("VUE_APP_")) {
            var key2 = key.slice(8);
            window[key2] = envs[key];
        }
    });

    jv.User_System = window.User_System;
    vueProtype.Server_Host = window.Server_Host;


    //重置数据
    Object.defineProperty(vueProtype, "$resetData", {
        value(data) {
            return Object.assign(this.$data, this.$options.data(this), data)
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * 保持和 HTMLElement 一致的方法名
     */
    Object.defineProperty(vueProtype, "chk_item", {
        value(chk, chk_msg) {
            return jv.chk_vue_item(this, chk, chk_msg)
        }, enumerable: false, configurable: true, writable: true
    });

    Object.defineProperty(HTMLElement.prototype, "chk_item", {
        value(chk, chk_msg) {
            return jv.chk_html_item(this, chk, chk_msg)
        }
    });

    /**
     * 保持和 HTMLElement 一致的方法名
     */
    Object.defineProperty(vueProtype, "chk", {
        value(setting) {
            return jv.chk_vue(this, setting);
        }, enumerable: false, configurable: true, writable: true
    });

    Object.defineProperty(HTMLElement.prototype, "chk", {
        value(setting) {
            return jv.chk_html(this, setting)
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * 查找dom下第一个绑定 v-model 的值.返回 { vnode : v-model 对象, value : v-model 的值, data }
     */
    Object.defineProperty(vueProtype, "$getVModelData", {
        value() {
            var convertValue = function (value) {
                return jv.isNull(value) ? "" : value
            }

            var vnode = this.$vnode, vdata = vnode.data, data = vnode.context._data;
            if (vdata && vdata.model && vdata.model.expression) {
                //什么情况下？ 用 vdata.model.value 判断 ？
                if ("value" in vdata.model) {
                    return {value: convertValue(vdata.model.value), data: data};
                }

                //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
                //对于 scope.row.name 这种表达式来说， 肯定会出错。
                var ret = jv.evalExpression(data, vdata.model.expression);
                if (jv.evalExpressionError) {
                    return {};
                }
                return {value: convertValue(ret), data: data};
            }

            return {};
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     *
     * @param vdom ,  htmlDom.__vue__ 是也
     * @returns {string|*}
     */
    Object.defineProperty(vueProtype, "$getBindExpression", {
        value() {
            var model = this.$vnode.data.model;
            return model && model.expression || "";
        }, enumerable: false, configurable: true, writable: true
    });
    /**
     * 通过表过式，查询绑定指定Expression的Dom,性能差
     * @param findExp
     * @return 返回值，可能是 html dom , 可能是 vue vdom
     */
    Object.defineProperty(vueProtype, "$findByBindExpression", {
        value(findExp) {
            var recusion_html = function (container, findExp) {
                var container_vue = container.__vue__;
                if (container_vue) {
                    return recusion_vue(container_vue, findExp)
                }
                if (container.$vnode) {
                    return recusion_vue(container, findExp)
                }

                for (var i = 0, children = container.children, len = (children && children.length || 0); i < len; i++) {
                    var item = children[i];
                    var ret = recusion_html(item, findExp)
                    if (ret) {
                        return ret;
                    }
                }
                return null;
            }

            var recusion_vue = function (container, findExp) {
                if (!container) return null;
                var exp = container.$getBindExpression();
                if (exp == findExp) {
                    return container;
                }
                for (var i = 0, children = container.$children, len = children.length; i < len; i++) {
                    var item = children[i];
                    var ret = recusion_vue(item, findExp);
                    if (ret) {
                        return ret;
                    }
                }
                return null;
            }

            var __vue__ = this.__vue__;
            if (this.$vnode) {
                return recusion_vue(this, findExp);
            } else if (__vue__) {
                return recusion_vue(__vue__, findExp);
            }
            return recusion_html(this, findExp);
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * 向下找 tag
     * callback 返回值：  0,false：停止遍历下级， -1:停止所有。
     * */
    Object.defineProperty(vueProtype, "$RecursionVNode", {
        value(callback) {
            callback = callback || jv.noop;
            var ret = callback(this);
            if ((ret === false) || (ret === 0) || (ret === -1)) return false;

            var child = this.$children;
            for (var i in child) {
                var ret = child[i].$RecursionVNode(callback);
                if (ret === -1) {
                    return false;
                }
            }
            return true;
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * Html元素向上找Vue元素,如果参数为空，找向上的第一个Vue元素。
     **/
    Object.defineProperty(vueProtype, "$Closest", {
        value(vueTagName) {
            let cur = this;
            if (!vueTagName && cur.$vnode) {
                return cur;
            }
            while (cur) {
                if (cur.$vnode && cur.$vnode.componentOptions.tag == vueTagName) {
                    return cur;
                }
                cur = cur.$parent;
            }
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * Html元素向上找Vue元素,如果参数为空，找向上的第一个Vue元素。
     **/
    Object.defineProperty(HTMLElement.prototype, "$Closest", {
        value(vueTagName) {
            let cur = this;
            while (cur) {
                if (!cur) {
                    break;
                }
                var v = cur.__vue__;
                if (v) {
                    return v.$Closest(vueTagName);
                }
                cur = cur.parentNode;
            }
        }, enumerable: false, configurable: true, writable: true
    });

    vue.mixin({
        updated: function () {
            //对所有 .kv [chk] 添加 must 样式。
            if (this.$el && this.$el.querySelectorAll) {
                Array.from(this.$el.querySelectorAll("[chk]")).forEach(chk_dom => {
                    var chk_container = chk_dom.closest("." + jv.chk_must_dom_class);
                    if (!chk_container) {
                        chk_container = chk_dom.closest("." + jv.chk_msg_vue_tag);
                        if (chk_container) {
                            chk_container = chk_container.parentNode;
                        }
                    }

                    if (chk_container) {
                        var chk_attr = chk_dom.getAttribute("chk") || "";
                        if (chk_attr[0] != '?') {
                            chk_container.classList.add("must");
                        }
                    }
                });
            }
        }
    });


    /** PrerenderSPAPlugin 插件，需要手动触发完成事件
     *  但是，在实际项目中，会有多次Ajax调用，在所有Ajax调用完成后再触发事件进行渲染。
     *  定义一个 SpaAjaxEnum 枚举，每次回发完成后进行设置，
     *  this.$done("SpaAjaxEnum枚举值")
     */
    jv.vue_spa_render_event = "render-event";
    jv.vue_spa_enum = "SpaAjaxEnum";

    vueProtype.$done = function (spa_enum, value) {
        if (!value) {
            value = spa_enum;
            spa_enum = jv.vue_spa_enum;
        }

        if (!value) {
            return;
        }

        if (!jv.enumAllSet(spa_enum, value)) return;

        this.$nextTick(() => {
            setTimeout(() => {
                document.dispatchEvent(new Event(jv.vue_spa_render_event));
            }, 200)
        });
    };

}

var initEnvAxios = function (axios) {
    jv.ajax = axios;

    axios.defaults.baseURL = window.Server_Host;
    axios.defaults.withCredentials = true;
    // axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    axios.defaults.headers['Content-Type'] = 'application/json; charset=UTF-8';
    var lang = document.cookieJson.get("lang");
    if (!lang) {
        document.cookieJson.set("lang", navigator.languageCode)
    }

    axios.defaults.transformRequest = function (data) {
        if (!data) return data;
        var type = data.Type;
        if (type == "formData") return data;
        if (type == "string") return data;
        return JSON.stringify(data)
        // return jv.param(data);
    };

// Add a request interceptor
    axios.interceptors.request.use(function (config) {
        if (config.url && (config.url.startsWith("http://") || config.url.startsWith("https://") || config.url.startsWith("//"))) {
            config.baseURL = "";
        }

        console.log("ajax:" + (new Date()).valueOf().toDateString() + " [" + config.method + "] " + config.baseURL + config.url);


        if (!config.javaBooleanKey) return config;
        if (!config.data) return config;
        var type = config.data.Type;
        if (!config.data.ObjectType && !["array", "set"].includes(type)) return config;

        //处理Java的布尔类型
        // jv.recursionJson(config.data, (target) => {
        //     Object.keys(target).forEach(key1 => {
        //         var value = target[key1];
        //
        //         if (value !== false && value !== true) {
        //             return;
        //         }
        //
        //         //转为 isUpper 形式。
        //         if (key1.length > 2 && (key1.slice(0, 2) == "is" && key1.charCodeAt(2).Between(65, 90))) {
        //             var key2 = key1[0].toLowerCase() + key1.slice(1);
        //             if ((key2 in target) == false) {
        //                 target[key2] = value;
        //                 delete target[key1];
        //             }
        //         }
        //     });
        // });


        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });


    axios.interceptors.response.use((response) => {
        if (!response) return;

        // Do something with response data
        var json = response.body = response.data;
        if (response.config.errorMsg && json && json.msg) {
            jv.error(json.msg);
            return Promise.reject({config: response.config, request: response.request, response, message: json.msg});
        }

        var type = json.Type;
        if (!["array", "set", "object", "map"].includes(type)) return response;

        //处理。
        // var data = json;
        if ((response.headers["content-type"] || "").indexOf("application/json") < 0) return response;

        //处理Java的布尔类型
        // if (!response.config.ignoreJavaBooleanKey) {
        //     jv.fixJavaBoolField(json);
        // }

        if (response.config.resType) {
            jv.fillRes(json);
        }

        return response;
    }, (error) => {
        //运行时错误
        if (error instanceof Error) {
            return Promise.reject(error);
        }
        if (error.config && !error.config.errorMsg) {
            return Promise.reject(error);
        }
        //如果网络有返回
        var resp = error.response;
        if (resp) {
            var status = resp.status;
            if (status == 401) {
                return Promise.reject(error);
            }
            if (status == 403) {
                jv.error("由于系统的权限限制，禁止您的访问");
                return Promise.reject(error);
            }
            if (status == 404) {
                jv.error("找不到请求！");
                return Promise.reject(error);
            }

            var data = resp.data;
            /*{"timestamp":1502603323197,"status":500,"error":"Internal Server Error","exception":"java.lang.Exception","message":"更新条件为空，不允许更新","path":"/sys/synchroMenuAndPermiss"}*/
            var errorMsg = (data && (data.msg || data.message)) || "系统错误:" + JSON.stringify(data);

            jv.error(errorMsg.slice(0, 100));
            return Promise.reject(error);
        }

        //网络没有返回， 网络连接问题。
        var msg = "";

        if (error.config) {
            msg += "<div>"
                + ((error.config.url.startsWith("http://") || error.config.url.startsWith("https://")) ? "" : error.config.baseURL)
                + error.config.url + "</div>";
        }
        msg += (error.message || "网络连接失败,请检查网络再试。");

        console.error(msg);
        document.write(msg);
        return Promise.reject(error);
    });
}


var initElementUI = function (ELEMENT) {
    if (!ELEMENT) return;

    ELEMENT.Button.props.size.default = "mini"
    ELEMENT.Input.props.size.default = "small"
    ELEMENT.Table.props.rowKey.default = "id";
    ELEMENT.Table.props.rowKey.default = "id";
    ELEMENT.TableColumn.props.showOverflowTooltip.default = true

    //设置 Element-ui 属性的默认值
    ELEMENT.Dialog.props.closeOnClickModal.default = false
    ELEMENT.Dialog.props.top.default = "";
    ELEMENT.Dialog.methods.setResizeDlg = function (el) {
        var self = this;
        var dlg_resize = function (e) {
            var body = e.target.frameElement.parentElement;
            self.$nextTick(() => {
                if (!self.visible) return;
                var bodyHeight = body.clientHeight;
                var winHeight = body.ownerDocument.documentElement.clientHeight;
                if ((bodyHeight + 30) < winHeight) {
                    body.style.marginTop = ((winHeight - bodyHeight) / 2 - 24) + "px";
                } else {
                    body.style.marginTop = "20px";
                }
            });
        }


        var body = this.$el.children[0];
        jv.domResize(body, dlg_resize)
    }

    ELEMENT.Dialog.methods.elChange = function (el) {
        this.setResizeDlg(el);
    }

    var dlg_ori_mounted = ELEMENT.Dialog.mounted;
    ELEMENT.Dialog.mounted = function () {
        dlg_ori_mounted.call(this);

        this.elChange(this.$el);
    }

    var dlg_ori_visible = ELEMENT.Dialog.watch.visible;
    ELEMENT.Dialog.watch.visible = function (val) {
        dlg_ori_visible.call(this, val);

        if (val && this.appendToBody) {
            this.elChange(this.$el)
        }
    }
}


jv.getRouteMetaTabName = function () {
    var route = jv.main.$route;
    if (!route) return "";
    return (route.meta.tab || "").format(Object.assign({}, route.params, route.query));
}

var initEnvRouter = function (router) {

}

jv.initVue = (setting) => {
    window.jv = jv;
    var {vue, axios, router, elementUI} = setting;

    //接受 postMessage,弹出错误消息。
    window.addEventListener('message', (e) => {
        //两个属性： event,arguments
        if (e.data.event == "error") {
            jv.error.apply(jv, e.data.arguments);
        }
    }, false);

    initEnvVue(vue);
    //axios 可以添加以下属性: javaBooleanKey resType errorMsg;
    //如: axios.defaults.errorMsg = true;
    initEnvAxios(axios);
    initElementUI(elementUI);
    initEnvRouter(router || vue.prototype.$route);
};


jv.getIdFromUrl = function (url) {
    return url.replace(/\//g, "-").replace(/[^0-9a-zA-Z]/g, "");
};

//----------------------router


export default jv;

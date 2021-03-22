import jv from "./file-upload"

/**
 * jv.initVue({vue:Vue,axios:axios,router:router});
 * @param setting
 * @returns {value|boolean|*}
 ajaxJavaBooleanKey ：默认为true , 是否处理 Java Boolean的Key，如：接口返回 admin:true , 转化为： isAdmin: true
 ajaxResType ： 默认为true , 系统默认对 boolean,date添加 _res 额外键，设置这个字段，会忽略指定的类型。该值是逗号分隔的字符串，有如下值：boolean,date
 ajaxErrorMsg: 默认为 true,系统默认认为 res.data.msg 是错误消息，弹窗提示
 */
jv.initVue = (setting) => {
    window.jv = jv;
    var {vue, axios, router, ajaxJavaBooleanKey, ajaxResType, ajaxErrorMsg} = setting;
    jv.Vue = vue;
    //关闭环境给出的提示.
    // vue.config.productionTip = false;
    var vueProtype = vue.prototype;
    vueProtype.jv = jv;
    vueProtype.$http = axios;

    var envs = process.env;
    window.BASE_URL = envs.BASE_URL;

    if (jv.isNull(ajaxJavaBooleanKey)) {
        ajaxJavaBooleanKey = true;
    }
    if (jv.isNull(ajaxResType)) {
        ajaxResType = true;
    }
    if (jv.isNull(ajaxErrorMsg)) {
        ajaxErrorMsg = true;
    }

    // jv.initVue_setting = {ajaxJavaBooleanKey, ajaxResType, ajaxErrorMsg};

    Object.keys(envs).forEach(key => {
        if (key.startsWith("VUE_APP_")) {
            var key2 = key.slice(8);
            window[key2] = envs[key];
        }
    });


    vueProtype.Server_Host = window.Server_Host;


    //接受 postMessage,弹出错误消息。
    window.addEventListener('message', (e) => {
        //两个属性： event,arguments
        if (e.data.event == "error") {
            jv.error.apply(jv, e.data.arguments);
        }
    }, false);

    //创建简单的 local store
    Object.defineProperty(vueProtype, "$my_store", {
        get() {
            return localStorage.my_store;
        }, enumerable: false
    });

    //创建简单的 session store
    Object.defineProperty(vueProtype, "$my_session_store", {
        get() {
            return sessionStorage.my_store;
        }, enumerable: false
    });

    //重置数据
    Object.defineProperty(vueProtype, "$resetData", {
        value(data) {
            return Object.assign(this.$data, this.$options.data(this), data)
        }, enumerable: false
    });

    /**
     * 保持和 HTMLElement 一致的方法名
     */
    Object.defineProperty(vueProtype, "chk_item", {
        value(chk, chk_msg) {
            return jv.chk_vue_item(this, chk, chk_msg)
        }, enumerable: false
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
        }, enumerable: false
    });

    Object.defineProperty(HTMLElement.prototype, "chk", {
        value(setting) {
            return jv.chk_html(this, setting)
        }, enumerable: false
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
                if ("value" in vdata.model) {
                    return {value: convertValue(vdata.model.value), data: data};
                }

                //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
                var ret = jv.evalExpression(data, vdata.model.expression);
                if (jv.evalExpressionError) {
                    return {};
                }
                return {value: convertValue(ret), data: data};
            }

            return {};

        }, enumerable: false
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
        }, enumerable: false
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

            if (this.$vnode) {
                return recusion_vue(this, findExp);
            } else if (this.__vue__) {
                return recusion_vue(this.__vue__, findExp);
            }
            return recusion_html(this, findExp);
        }, enumerable: false
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

            for (var i in this.$children) {
                var ret = this.$children[i].$RecursionVNode(callback);
                if (ret === -1) {
                    return false;
                }
            }
            return true;
        }, enumerable: false
    });

    //向上查找Vue元素.
    Object.defineProperty(vueProtype, "$Closest", {
        value(vueTagName) {
            let cur = this;
            while (cur) {
                if (cur.$vnode && cur.$vnode.componentOptions.tag == vueTagName) {
                    return cur;
                }
                cur = cur.$parent;
            }
        }, enumerable: false
    });

    /*Html元素向上找Vue元素*/
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
        }, enumerable: false
    });

    //----------------------------------- axios
    //代理 post

    jv.Vue.mixin({
        // data() {
        //     return {
        //         //轻量化，控制 vue_jv.an_version (data 里属性不能以 $,_ 开头。)
        //         vue_jv: {}
        //     }
        // },
        updated: function () {
            //对所有 .kv [chk] 添加 must 样式。
            if (jv.chk_must_dom_class && this.$el && this.$el.querySelectorAll) {
                Array.from(this.$el.querySelectorAll("." + jv.chk_must_dom_class)).forEach(it => {
                    if (it.querySelector("[chk]")) {
                        it.classList.add("must");
                    }
                });
            }
        }
    });


    jv.ajax = axios;
    axios.defaults.javaBooleanKey = ajaxJavaBooleanKey;
    axios.defaults.resType = ajaxResType;
    axios.defaults.errorMsg = ajaxErrorMsg;

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
        if (!error.config.errorMsg) {
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

    jv.getIdFromUrl = function (url) {
        return url.replace(/\//g, "-").replace(/[^0-9a-zA-Z]/g, "");
    };

    //----------------------router
    /**
     * 添加外部的 script 标签
     */
    jv.addScriptFile = (fileName, attributes) => {
        if (!fileName) return Promise.reject();

        var id = jv.getIdFromUrl(fileName);

        var script = document.getElementById(id);
        if (script) {
            return Promise.resolve();
        }
        attributes = attributes || {};
        if (!attributes.type) {
            attributes.type = "text/javascript";
        }
        attributes.id = id;

        return new Promise((r, e) => {
            script = document.createElement("script");

            script.onload = script.onreadystatechange = function () {
                if (!this.readyState     //这是FF的判断语句，因为ff下没有readyState这人值，IE的readyState肯定有值
                    || this.readyState == 'loaded' || this.readyState == 'complete'   // 这是IE的判断语句
                ) {
                    r();
                }
            };

            Object.keys(attributes).forEach(it => {
                script.setAttribute(it, attributes[it]);
            });

            script.src = fileName;
            document.head.appendChild(script);
        });
    };

    /**
     * 添加 link css的文件引用。
     */
    jv.addLinkCssFile = (fileName, attributes) => {
        if (!fileName) return;

        var id = jv.getIdFromUrl(fileName);

        var link = document.getElementById(id);
        if (link) {
            return;
        }

        link = document.createElement("link");

        attributes = attributes || {};

        if (!attributes.type) {
            attributes.type = "text/css";
        }
        if (!attributes.rel) {
            attributes.rel = "stylesheet";
        }
        attributes.id = id;

        Object.keys(attributes).forEach(it => {
            link.setAttribute(it, attributes[it]);
        });

        link.href = fileName;
        document.head.appendChild(link);
    };

    //添加 style 标签
    jv.addStyleDom = (id, cssContent, attributes) => {
        if (!cssContent) return;


        var style = id && document.getElementById(id);
        if (!style) {
            style = document.createElement("style");
            document.head.appendChild(style);
        }
        attributes = attributes || {};

        if (!attributes.type) {
            attributes.type = "text/css";
        }

        if (id) {
            attributes.id = id;
        }

        Object.keys(attributes).forEach(it => {
            style.setAttribute(it, attributes[it]);
        });

        if (style.styleSheet) {
            style.styleSheet.cssText = cssContent;
        } else {
            style.innerHTML = cssContent;
        }
    };


    /** PrerenderSPAPlugin 插件，需要手动触发完成事件
     *  但是，在实际项目中，会有多次Ajax调用，在所有Ajax调用完成后再触发事件进行渲染。
     *  定义一个 SpaAjaxEnum 枚举，每次回发完成后进行设置，
     *  this.$done("SpaAjaxEnum枚举值")
     */
    jv.vue_spa_render_event = "render-event";
    jv.vue_spa_enum = "SpaAjaxEnum";

    jv.Vue.prototype.$done = function (spa_enum, value) {
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

    // jv.Vue.mixin({
    //     updated() {
    //         var tagName = this.$vnode && this.$vnode.componentOptions.tag;
    //         if (!tagName) {
    //             return;
    //         }
    //         // var p = this.$vnode.componentOptions;
    //         var p = this;
    //         //有的时候不灵，很奇怪。
    //         if (tagName == "el-button") {
    //             if (!p.size) {
    //                 p.size = "mini";
    //             }
    //
    //         } else if (tagName == "el-table") {
    //             // if (this.$vnode.componentOptions.tag == "my-list") {
    //             //     return;
    //             // }
    //
    //             if (jv.isNull(p.border)) {
    //                 p.border = true;
    //             }
    //             if (jv.isNull(p.stripe)) {
    //                 p.stripe = true;
    //             }
    //         }
    //     }
    // });

    // router.afterEach((to, from, next) => {
    //   jv.loadAllJson(to.fullPath);
    // });
};


export default jv;

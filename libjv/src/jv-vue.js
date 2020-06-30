import jv from "./file-upload"

/**
 * jv.initVue({vue:Vue,axios:axios,router:router});
 * @param setting
 * @returns {value|boolean|*}
 ajaxIgnoreJavaBooleanKey ：默认为false , 是否处理 Java Boolean的Key，如：接口返回 admin:true , 转化为： isAdmin: true
 ajaxIgnoreResType ： 默认为false , 系统默认对 boolean,date添加 _res 额外键，设置这个字段，会忽略指定的类型。该值是逗号分隔的字符串，有如下值：boolean,date
 */
jv.initVue = (setting) => {
    var {vue, axios, router, ajaxIgnoreJavaBooleanKey, ajaxIgnoreResType, ignoreMsg} = setting;
    jv.Vue = vue;
    //关闭环境给出的提示.
    // vue.config.productionTip = false;
    var vueProtype = vue.prototype;
    vueProtype.jv = jv;
    vueProtype.Server_Host = window.Server_Host;
    vueProtype.$http = axios;

    jv.initVue_setting = {ajaxIgnoreJavaBooleanKey, ajaxIgnoreResType};


    window.BASE_URL = process.env.BASE_URL;
    Object.keys(process.env).forEach(key => {
        if (key.startsWith("VUE_APP_")) {
            var key2 = key.slice(8);
            window[key2] = process.env[key];
        }
    });

    // vueProtype.Upload_Url = window.Server_Host + "/sys/upload";

    // Object.defineProperty(vueProtype, "$resetData", {
    //   value () {
    //     return Object.assign(this.$data, this.$options.data());
    //   }, enumerable: false
    // });

    //创建简单的 store
    vueProtype.$my_store = {
        setGlobalJson(data) {
            jv.store.setJson("global", Object.assign({}, this.getGlobal(), data));
        },
        getGlobalJson() {
            return jv.store.getJson("global");
        },
        resetGlobalJson(data) {
            jv.store.setJson("global", data);
        },
        setJson(key, v) {
            var data = {};
            if (key && v && (key.Type == "string")) {
                var obj = {};
                obj[key] = v;
                data = obj;
            } else {
                data = key;
            }
            jv.store.setJson(jv.main.$route.fullPath, Object.assign({}, this.getJson(), data));
        },
        getJson(key) {
            var ret = jv.store.getJson(jv.main.$route.fullPath);
            if (key) {
                return ret[key] || {};
            }
            return ret;
        },
        resetJson(data) {
            jv.store.setJson(jv.main.$route.fullPath, data);
        }
    };

    Object.defineProperty(vueProtype, "chk", {
        value(singleShow) {
            return jv.chk_vue_dom(this, singleShow);
        }, enumerable: false
    });


    Object.defineProperty(HTMLElement.prototype, "chk", {
        value(singleShow) {
            //遍历所有的Vue元素。
            var recusion_vue_dom = (dom, singleShow) => {
                if (dom.__vue__) {
                    return dom.__vue__.chk(singleShow);
                }

                var ret = true;

                for (var i = 0, children = dom.children, len = children.length; i < len; i++) {
                    var item = children[i];
                    ret &= recusion_vue_dom(item, singleShow);
                    if ((ret === false) && singleShow) {
                        return ret;
                    }
                }

                return ret;
            };

            return recusion_vue_dom(this, singleShow)
        }
    });

    /*向下找 tag*/
    Object.defineProperty(vueProtype, "$Find", {
        value(ele) {
            if (this.$vnode.componentOptions.tag == ele) {
                return this;
            }
            for (var i in this.$children) {
                var ret = this.$children[i].$Find(ele);
                if (ret) {
                    return ret;
                }
            }
        }, enumerable: false
    });

    //向上找元素.
    Object.defineProperty(vueProtype, "$Closest", {
        value(ele) {
            let cur = this;
            while (cur) {
                if (cur.$vnode.componentOptions.tag == ele) {
                    return cur;
                }
                cur = cur.$parent;
            }
        }, enumerable: false
    });

    /*Html元素向上找Vue元素*/
    Object.defineProperty(HTMLElement.prototype, "$Closest", {
        value() {
            let cur = this;
            while (cur) {
                if (cur.__vue__) {
                    return cur;
                }
                cur = cur.parentNode;
            }
        }, enumerable: false
    });
    //----------------------------------- axios
    //代理 post

    // var ori_post = axios.post;
    //
    // axios.post = (url, data, config) => {
    //     var need_ajax = false;
    //     if (!config.cache) {
    //         need_ajax = true;
    //     } else {
    //         var key = "post." + url + "." + jv.param(data);
    //         if (config.cache === "storage") {
    //             var json = jv.store.getJson(key);
    //
    //         } else if (config.cache === "page") {
    //             var json = jv.cache_db[key] || {};
    //         } else {
    //             throw new Error("不识别的缓存类型:" + config.cache)
    //         }
    //
    //         if (Object.keys(json).length) {
    //             return Promise.resolve(json);
    //         } else {
    //             need_ajax = true;
    //         }
    //     }
    //
    //     if (need_ajax) {
    //         return ori_post.call(this, url, data, config);
    //     }
    // };


    jv.ajax = axios;
    axios.defaults.ignoreJavaBooleanKey = ajaxIgnoreJavaBooleanKey;
    axios.defaults.ignoreResType = ajaxIgnoreResType;

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
        if (config.url.startsWith("http://") || config.url.startsWith("https://")) {
            config.baseURL = "";
        }

        console.log((new Date()).valueOf().toDateString() + " [" + config.method + "] " + config.baseURL + config.url);


        if (config.ignoreJavaBooleanKey) return config;
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
        // Do something with response data
        var json = response.body = response.data;
        if (!ignoreMsg && json && json.msg) {
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

        jv.fillRes(json, null, null, response.config.ignoreResType);

        return response;
    }, (error) => {

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
            msg += "<div>" + error.config.baseURL + error.config.url + "</div>";
        }
        msg += (error.message || "网络连接失败,请检查网络再试。");

        console.error(msg);
        document.write(msg);
        return Promise.reject(error);
    });


    //----------------------router
    //添加外部的 script 标签
    jv.addScriptFile = (id, fileName, attributes) => {
        if (!fileName) return;

        var script = id && document.getElementById(id);
        if (!script) {
            script = document.createElement("script");
            document.head.appendChild(script);
        }
        attributes = attributes || {};

        if (!attributes.type) {
            attributes.type = "text/javascript";
        }

        if (id) {
            attributes.id = id;
        }

        attributes.src = fileName;

        Object.keys(attributes).forEach(it => {
            script.setAttribute(it, attributes[it]);
        });
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

    // router.afterEach((to, from, next) => {
    //   jv.loadAllJson(to.fullPath);
    // });
};


export default jv;

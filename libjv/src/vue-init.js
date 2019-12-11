import jv from "./libjv"

//默认实现。


//init router permission
// jv.initRouter = function (router) {
// //规则：如果没有定义，按上级配置。 如果最上级没有配置，按false
//     router.options.routes.recursion(it => {
//         return it.children;
//     }, it => {
//
//         if (!("_permission" in it)) {
//             it._permission = it.permission || false;
//         }
//         if (!("_url" in it)) {
//             it._url = it.path || "";
//         }
//
//         if (it.children) {
//             var emptyPathItem = null;
//             for (let item of it.children) {
//                 if (!("permission" in item)) {
//                     item._permission = it._permission;
//                 }
//                 else {
//                     item._permission = item.permission;
//                 }
//
//                 if (!item.path) {
//                     emptyPathItem = it;
//                     item._url = it._url;
//                 }
//                 else {
//                     item._url = it._url + "/" + item.path;
//                 }
//             }
//
//             if (emptyPathItem) {
//                 emptyPathItem._url = "";
//                 emptyPathItem._permission = false;
//             }
//         }
//     })
//
//     router.options.permission = [];
//     router.options.routes.recursion(it => {
//         return it.children;
//     }, it => {
//         if (it._permission && it._url) {
//             router.options.permission.push(it._url);
//         }
//     })
//
//     router.options.routes.recursion(it => {
//         return it.children;
//     }, it => {
//         delete it._permission
//         delete it._url
//     });
// }
//
// //获取需要在菜单上设置的权限页面.
// jv.getPermissions = function () {
//     var ret = {};
//     var routes = window._vue.$router.options.routes;
//     routes.recursion(it => {
//         return it.children;
//     }, it => {
//         if (it.permission) {
//             ret[it.path] = it.permission;
//         }
//     });
//
//     _vue.menus.recursion(it => {
//         return it.subMenus;
//     }, it => {
//         if (it.url in ret) {
//             delete ret[it.url];
//         }
//     })
//
//     return ret;
// }

/**
 * jv.initVue({vue:Vue,axios:axios,router:router});
 * @param setting
 * @returns {value|boolean|*}
 ajaxIgnoreJavaBooleanKey ：默认为false , 是否处理 Java Boolean的Key，如：接口返回 admin:true , 转化为： isAdmin: true
 ajaxIgnoreResType ： 默认为false , 系统默认对 boolean,date添加 _res 额外键，设置这个字段，会忽略指定的类型。该值是逗号分隔的字符串，有如下值：boolean,date
 */
jv.initVue = (setting) => {
    var {vue, axios, router, ajaxIgnoreJavaBooleanKey, ajaxIgnoreResType} = setting;
    jv.Vue = vue;
    //关闭环境给出的提示.
    // vue.config.productionTip = false;
    var vueProtype = vue.prototype;
    vueProtype.jv = jv;
    vueProtype.Server_Host = window.Server_Host;
    // vueProtype.Upload_Url = window.Server_Host + "/sys/upload";

    // Object.defineProperty(vueProtype, "$resetData", {
    //   value () {
    //     return Object.assign(this.$data, this.$options.data());
    //   }, enumerable: false
    // });

    //创建简单的 store
    vueProtype.$store = {
        setGlobalJson(data) {
            jv.store.setJson("global", Object.assign({}, this.getGlobal(), data));
        },
        getGlobalJson() {
            return jv.store.getJson("global") || {};
        },
        resetGlobalJson(data) {
            jv.store.setJson("global", data);
        },
        setJson(data) {
            jv.store.setJson(jv.main.$route.fullPath, Object.assign({}, this.getJson(), data));
        },
        getJson() {
            return jv.store.getJson(jv.main.$route.fullPath) || {};
        },
        resetJson(data) {
            jv.store.setJson(jv.main.$route.fullPath, data);
        }
    };

    Object.defineProperty(vueProtype, "chk", {
        value(chk_show) {
            return jv.chk_vue_dom(this, chk_show);
        }, enumerable: false
    });

    Object.defineProperty(vueProtype, "$Find", {
        value(ele) {
            if (this.$el == ele) {
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
    Object.defineProperty(vueProtype, "closest", {
        value(ele) {
            let cur = this;
            while (cur) {
                if (cur.$el == ele) {
                    return cur;
                }
                cur = cur.$parent;
            }
        }, enumerable: false
    });

    //----------------------------------- axios

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
        console.log((new Date()).valueOf().toDateString() + " [" + config.method + "] " + config.baseURL + config.url);


        if (config.ignoreJavaBooleanKey) return config;
        if (!config.data) return config;
        var type = config.data.Type;
        if (!config.data.ObjectType && !["array", "set"].includes(type)) return config;

        //处理Java的布尔类型
        jv.recursionJson(config.data, (key1, value, target) => {
            if (value !== false && value !== true) {
                return;
            }

            //转为 isUpper 形式。
            if (key1.length > 2 && (key1.slice(0, 2) == "is" && key1.charCodeAt(2).Between(65, 90))) {
                var key2 = key1[0].toLowerCase() + key1.slice(1);
                if (key2 in target == false) {
                    target[key2] = value;
                    delete target[key1];
                }
            }
        });


        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });


    axios.interceptors.response.use((response) => {
        // Do something with response data
        var json = response.body = response.data;
        if (json && json.msg) {
            jv.error(json.msg);
            return Promise.reject({config: response.config, request: response.request, response, message: json.msg});
        }

        var type = json.Type;
        if (!json.ObjectType && !["array", "set"].includes(type)) return response;

        //处理。
        var data = json;
        if ((response.headers["content-type"] || "").indexOf("application/json") < 0) return response;


        //处理Java的布尔类型
        if (!response.config.ignoreJavaBooleanKey) {
            jv.recursionJson(json, (key1, value, target) => {
                if (value !== false && value !== true) {
                    return;
                }

                //转为 isUpper 形式。
                if (key1.length > 2 && (key1.slice(0, 2) == "is" && key1.charCodeAt(2).Between(65, 90))) {

                } else {
                    var key2 = "is" + key1[0].toUpperCase() + key1.slice(1)
                    if (key2 in target == false) {
                        target[key2] = value;
                        delete target[key1];
                    }
                }
            });
        }

        jv.fillRes(json, null, null, response.config.ignoreResType);

        return response;
    }, (error) => {
        if (!error.response) {
            var msg = "";
            try {
                msg = (error.message || "网络错误") + ":" + error.config.url;
            } catch (e) {
                msg = "网络错误"
            }
            jv.error(msg, "", "ajax");
            return Promise.reject(error);
        }
        var resp = error.response;
        var status = resp.status;
        if (status == 401) {
            return Promise.reject(error);
        }
        if (status == 403) {
            jv.error("由于系统的权限限制，禁止您的访问", "", "ajax");
            return Promise.reject(error);
        }
        if (status == 404) {
            jv.error("找不到请求！", "", "ajax");
            return Promise.reject(error);
        }

        var data = resp.data;
        /*{"timestamp":1502603323197,"status":500,"error":"Internal Server Error","exception":"java.lang.Exception","message":"更新条件为空，不允许更新","path":"/sys/synchroMenuAndPermiss"}*/
        var errorMsg = (data && (data.msg || data.message)) || "系统错误:" + JSON.stringify(data);

        jv.error(errorMsg.slice(0, 100), "", "ajax");
        return Promise.reject(error);
    });


    //----------------------router


    router.afterEach((to, from, next) => {
        jv.loadAllJson(to.fullPath);
    });
};


// jv.getAjaxCacheKey = function (config) {
//     if (!config || !config.cache || !config.url) {
//         return "";
//     }
//
//     var type = (config.data || {}).Type;
//     if (type == "formData") {
//         return "";
//     }
//
//     var data_string = config.data;
//     if (type != "string") {
//         data_string = JSON.stringify(config.data);
//     }
//     return config.method + ":" + config.url + "!" + data_string;
// };


export default jv;
import jv from "./libjv"

//默认实现。
jv.info = jv.error = jv.warn = function (msg) {
    alert(msg);
};


//init router permission
jv.initRouter = function (router) {
//规则：如果没有定义，按上级配置。 如果最上级没有配置，按false
    router.options.routes.recursion(it => {
        return it.children;
    }, it => {

        if (!("_permission" in it)) {
            it._permission = it.permission || false;
        }
        if (!("_url" in it)) {
            it._url = it.path || "";
        }

        if (it.children) {
            var emptyPathItem = null;
            for (let item of it.children) {
                if (!("permission" in item)) {
                    item._permission = it._permission;
                }
                else {
                    item._permission = item.permission;
                }

                if (!item.path) {
                    emptyPathItem = it;
                    item._url = it._url;
                }
                else {
                    item._url = it._url + "/" + item.path;
                }
            }

            if (emptyPathItem) {
                emptyPathItem._url = "";
                emptyPathItem._permission = false;
            }
        }
    })

    router.options.permission = [];
    router.options.routes.recursion(it => {
        return it.children;
    }, it => {
        if (it._permission && it._url) {
            router.options.permission.push(it._url);
        }
    })

    router.options.routes.recursion(it => {
        return it.children;
    }, it => {
        delete it._permission
        delete it._url
    });
}

//获取需要在菜单上设置的权限页面.
jv.getPermissions = function () {
    var ret = {};
    var routes = window._vue.$router.options.routes;
    routes.recursion(it => {
        return it.children;
    }, it => {
        if (it.permission) {
            ret[it.path] = it.permission;
        }
    });

    _vue.menus.recursion(it => {
        return it.subMenus;
    }, it => {
        if (it.url in ret) {
            delete ret[it.url];
        }
    })

    return ret;
}

jv.initApp = function (vue) {
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

    Object.defineProperty(vueProtype, "chk", {
        value(chk_show) {
            return this.$el.chk(chk_show);
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
}

jv.getAjaxCacheKey = function (config) {
    if (!config || !config.cache || !config.url) {
        return "";
    }

    var type = (config.data || {}).Type;
    if (type == "formData") {
        return "";
    }

    var data_string = config.data;
    if (type != "string") {
        data_string = JSON.stringify(config.data);
    }
    return config.method + ":" + config.url + "!" + data_string;
};
jv.initAxios = function (axios) {

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
        console.log((new Date()).valueOf().toDateString() + " [" + config.method + "] " + config.baseURL + config.url)
        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });
// Add a response interceptor

    // process.on('uncaughtException', function (e) {
    //     console.error('Catch in process', e);
    // });

    // var dateTimeRegex = /^\d{4}-[0-1]?\d-[0-3]?\d( [0-2]?\d:[0-5]?\d:[0-5]?\d)?$/
    //
    // var translateDate = function (value, callback) {
    //     if (!value) return;
    //     var dtValue, valueType = value.Type;
    //
    //     if (valueType == "array") {
    //         for (var i = value.length - 1; i >= 0; i--) {
    //             dtValue = translateDate(value[i]);
    //             if (dtValue) {
    //                 value[i] = dtValue;
    //             }
    //         }
    //     }
    //     else if (valueType == "object") {
    //         let keys = Object.keys(value);
    //         for (var i = keys.length - 1; i >= 0; i--) {
    //             var key = keys[i];
    //             dtValue = translateDate(value[key]);
    //             if (dtValue) {
    //                 value[key] = dtValue;
    //             }
    //         }
    //     }
    //     else if (valueType == "string") {
    //         if (dateTimeRegex.test(value)) {
    //             return new Date(value);
    //         }
    //     }
    // };

    axios.interceptors.response.use((response) => {
        // Do something with response data
        var json = response.body = response.data;
        if (json && json.msg) {
            jv.error(json.msg);
            return Promise.reject({config: response.config, request: response.request, response, message: json.msg});
        }

        //自动转换 Date 类型
        // translateDate(json);

        // var cacheKey = jv.getAjaxCacheKey(response.config);
        // //最多保存500个缓存记录
        // if (cacheKey && json.data && (jv.cache_db.length < 500)) {
        //     jv.cache_db[cacheKey] = {data: JSON.stringify(json), cacheAt: (new Date()).totalSeconds};
        // }
        return response;
    }, (error) => {
        if (!error.response) {
            jv.error("系统错误");
            return Promise.reject(error);
        }
        var resp = error.response;
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
        var errorMsg = (data && (data.msg || data.message)) || "系统错误";

        jv.error(errorMsg.slice(0, 100));
        return Promise.reject(error);
    });


    // var ori_post = axios.post;
    // axios.post = function (url, data, config) {
    //     if (config && config.cache && config.cache.Type == "function") {
    //         config.cache = config.cache(config.data);
    //     }
    //
    //     var cacheKey = jv.getAjaxCacheKey(Object.assign({}, config, {
    //         method: "post",
    //         url: jv.ajax.defaults.baseURL + url,
    //         data: jv.ajax.defaults.transformRequest(data)
    //     }));
    //     if (cacheKey in jv.cache_db) {
    //         var cacheData = jv.cache_db[cacheKey];
    //
    //         if (config.cache === +config.cache) {
    //             if ((new Date()).totalSeconds - cacheData.cacheAt < config.cache) {
    //                 return Promise.resolve({data: JSON.parse(cacheData.data)});
    //             }
    //         }
    //         else {
    //             return Promise.resolve({data: JSON.parse(cacheData.data)});
    //         }
    //     }
    //     return ori_post(url, data, config);
    // };


    //打包Post
    axios.groupPost = function (urls) {
        return axios.post("/group-ajax", urls
            // , {
            //     transformResponse: [function (data) {
            //         if (data && data.length) {
            //             data.forEach(it => {
            //                 if ("body" in it) {
            //                     it.body = it.body.replace(String.fromCharCode(7), "\n-\n");
            //                 }
            //             })
            //         }
            //     }]
            // }
        );
    }
};

export default jv;
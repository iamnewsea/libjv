"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _libjv = require("./libjv");

var _libjv2 = _interopRequireDefault(_libjv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//默认实现。
_libjv2.default.info = _libjv2.default.error = _libjv2.default.warn = function (msg) {
  alert(msg);
};

//init router permission
_libjv2.default.initRouter = function (router) {
  //规则：如果没有定义，按上级配置。 如果最上级没有配置，按false
  router.options.routes.recursion(function (it) {
    return it.children;
  }, function (it) {

    if (!("_permission" in it)) {
      it._permission = it.permission || false;
    }
    if (!("_url" in it)) {
      it._url = it.path || "";
    }

    if (it.children) {
      var emptyPathItem = null;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = it.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (!("permission" in item)) {
            item._permission = it._permission;
          } else {
            item._permission = item.permission;
          }

          if (!item.path) {
            emptyPathItem = it;
            item._url = it._url;
          } else {
            item._url = it._url + "/" + item.path;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (emptyPathItem) {
        emptyPathItem._url = "";
        emptyPathItem._permission = false;
      }
    }
  });

  router.options.permission = [];
  router.options.routes.recursion(function (it) {
    return it.children;
  }, function (it) {
    if (it._permission && it._url) {
      router.options.permission.push(it._url);
    }
  });

  router.options.routes.recursion(function (it) {
    return it.children;
  }, function (it) {
    delete it._permission;
    delete it._url;
  });
};

//获取需要在菜单上设置的权限页面.
_libjv2.default.getPermissions = function () {
  var ret = {};
  var routes = window._vue.$router.options.routes;
  routes.recursion(function (it) {
    return it.children;
  }, function (it) {
    if (it.permission) {
      ret[it.path] = it.permission;
    }
  });

  _vue.menus.recursion(function (it) {
    return it.subMenus;
  }, function (it) {
    if (it.url in ret) {
      delete ret[it.url];
    }
  });

  return ret;
};

_libjv2.default.initApp = function (vueProtype) {
  _libjv2.default.Vue_Prototype = vueProtype;
  vueProtype.Base_Url = window.Base_Url;
  vueProtype.Upload_Url = window.Base_Url + "/sys/fileUpload";

  // Object.defineProperty(vueProtype, "$resetData", {
  //   value () {
  //     return Object.assign(this.$data, this.$options.data());
  //   }, enumerable: false
  // });

  Object.defineProperty(vueProtype, "chk", {
    value: function value(chk_show) {
      return this.$el.chk(chk_show);
    },
    enumerable: false
  });

  Object.defineProperty(vueProtype, "$Find", {
    value: function value() {
      if (this.$el == ele) {
        return this;
      }
      for (var i in this.$children) {
        var ret = this.$children[i].$Find(ele);
        if (ret) {
          return ret;
        }
      }
    },
    enumerable: false
  });

  //向上找元素.
  Object.defineProperty(vueProtype, "closest", {
    value: function value(ele) {
      var cur = this;
      while (cur) {
        if (cur.$el == ele) {
          return cur;
        }
        cur = cur.$parent;
      }
    },
    enumerable: false
  });
};

_libjv2.default.initAxios = function (axios) {
  axios.defaults.baseURL = window.Base_Url;
  axios.defaults.withCredentials = true;
  // axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  axios.defaults.headers['Content-Type'] = 'application/json; charset=UTF-8';
  var lang = document.cookieMap.get("lang");
  if (!lang) {
    document.cookieMap.set("lang", navigator.languageCode);
  }

  axios.defaults.transformRequest = function (data) {
    if (!data) return data;
    var type = data.Type;
    if (type == "formData") return data;
    if (type == "string") return data;
    return JSON.stringify(data);
    // return jv.param(data);
  };

  // Add a request interceptor
  axios.interceptors.request.use(function (config) {
    // if (window.debugger) {
    //   eval("debugger;");
    // }
    // Do something before request is sent
    //config.headers["cookie"]="";
    console.log(new Date().valueOf().toDateString() + " [" + config.method + "] " + config.url);
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });
  // Add a response interceptor

  process.on('uncaughtException', function (e) {
    console.error('Catch in process', e);
  });

  axios.interceptors.response.use(function (response) {
    // Do something with response data
    response.body = response.data;
    if (response.data && response.data.msg) {
      _libjv2.default.error(response.data.msg);
      return Promise.reject(response);
    }
    return response;
  }, function (error) {
    if (!error.response) {
      _libjv2.default.error("系统错误");
      return Promise.reject(error);
    }
    var resp = error.response;
    var status = resp.status;
    if (status == 401) {
      window._vue._data.loginFromVisible = true;
      return Promise.reject(error);
    }
    if (status == 403) {
      _libjv2.default.error("由于系统的权限限制，禁止您的访问");
      return Promise.reject(error);
    }
    if (status == 404) {
      _libjv2.default.error("找不到请求！");
      return Promise.reject(error);
    }

    var data = resp.data;
    /*{"timestamp":1502603323197,"status":500,"error":"Internal Server Error","exception":"java.lang.Exception","message":"更新条件为空，不允许更新","path":"/sys/synchroMenuAndPermiss"}*/
    var errorMsg = data && (data.msg || data.message) || "系统错误";

    _libjv2.default.error(errorMsg.slice(0, 100));
    return Promise.reject(error);
  });
};

exports.default = _libjv2.default;
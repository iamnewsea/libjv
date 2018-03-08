"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require("./defineProperty");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//单例.
var jv;
var JvObject = function () {
  //私有字段。
  // var db = Symbol("db");

  var JvObject = function JvObject() {
    _classCallCheck(this, JvObject);

    if (!jv) {
      jv = this;
    }

    // this[db] = {id:1};
    return jv;
  }

  // get db(){
  //   return this[db];
  // }
  ;

  return JvObject;
}();

jv = new JvObject();
//---------------------------------------------

//提供 基于 localStorage的缓存数据.
//距离 2000 年的秒数。
jv.db = {
  get: function get(key) {
    if (!key) return null;
    key = "jv.db." + key;
    var ret = localStorage.getItem(key);
    if (!ret) return null;
    ret = JSON.parse(localStorage.getItem(key));
    if (!ret) return null;
    if (ret.expireAt < new Date().totalSeconds) {
      localStorage.removeItem(key);
      return null;
    }

    return ret.value;
  },
  set: function set(key, value, cacheSeconds) {
    key = "jv.db." + key;

    if (value === null) {
      return localStorage.removeItem(key);
    }

    cacheSeconds = cacheSeconds || 600; //默认10分钟。

    if (cacheSeconds < 0) return;

    localStorage.setItem(key, JSON.stringify({ value: value, expireAt: new Date().totalSeconds + cacheSeconds }));
  }
};

/*
定义枚举, 生成 jv.枚举 = {}
使用 对象.Enumer(键,jv.枚举)  对对象的key进行枚举化。
 */
jv.defEnum = function (typeName, json, sep) {
  var ret = { type: typeName };
  var i = -1;
  Object.keys(json).forEach(function (it) {
    var value = json[it];
    i++;
    if (!value.value && value.value !== 0) {
      if (sep) {
        var sepIndex = value.indexOf(sep);
        json[it] = { value: parseInt(value.substr(0, sepIndex)), remark: value.substr(sepIndex + 1) };
      } else {
        json[it] = { name: it, value: i, remark: json[it] };
      }
    }
  });

  ret.getData = function (key) {
    if (key) {
      return json[key];
    }
    return Object.keys(json).map(function (it) {
      return json[it];
    });
  };

  jv[typeName] = ret;
  return ret;
};

jv.isPlainObject = function (obj) {
  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if (!obj || {}.toString.call(obj) !== "[object Object]") {
    return false;
  }
  return true;
};

jv.random = function (min, max) {
  if (!min && !max) {
    return "r" + Math.random().toString(36).slice(3);
  }

  if (!max) {
    max = min;
    min = 0;
  }

  return min + parseInt(Math.random() * (max - min));
};
/**
 *
 * @param delayTime  循环暂停时间
 * @param action     每次循环的回调。
 * @param times      最多循环次数， 默认为 100
 * @returns {*}
 */
jv.await = function (delayTime, times, action) {
  times = times || 0;
  if (!times) {
    return;
  }

  if (action() !== false) {
    return setTimeout(function () {
      jv.await(delayTime, times - 1, action);
    }, delayTime);
  }
};

/**Java方式的序列化。
 Java定义：
 data class role(var name: String = "", var remark: String = "")
 data class user(var name: String = "", var roles: Array<role> = arrayOf())
 data class corp(var name: String = "", var users: Array<user> = arrayOf());

 @PostMapping(value = "hi")
 fun hiPost(qm: corp, session: HttpSession): String {}

 Java格式的数据：(如果数组是简单值的数组，可以使用 "," 连接，如： roles:"销售,开发" )
 map["name"] = "金维度";
 map["users[0].name"] = "张三";
 map["users[0].roles[0].name"] = "销售";
 map["users[0].roles[0].remark"] = "销售角色";

 map["users[1].name"] = "本四";
 map["users[1].roles[0].name"] = "开发";
 map["users[1].roles[0].remark"] = "开发角色";
 map["users[1].roles[1].name"] = "UI";
 map["users[1].roles[1].remark"] = "设计师";

 PostBody：
 name=%E9%87%91%E7%BB%B4%E5%BA%A6&users%5B0%5D.name=%E5%BC%A0%E4%B8%89&users%5B0%5D.roles%5B0%5D.name=%E9%94%80%E5%94%AE&users%5B0%5D.roles%5B0%5D.remark=%E9%94%80%E5%94%AE%E8%A7%92%E8%89%B2&users%5B1%5D.name=%E6%9C%AC%E5%9B%9B&users%5B1%5D.roles%5B0%5D.name=%E5%BC%80%E5%8F%91&users%5B1%5D.roles%5B0%5D.remark=%E5%BC%80%E5%8F%91%E8%A7%92%E8%89%B2&users%5B1%5D.roles%5B1%5D.name=UI&users%5B1%5D.roles%5B1%5D.remark=%E8%AE%BE%E8%AE%A1%E5%B8%88

 Js提交对象：
 var data =
 {name:"金维度",users:
   [
     {name:"张三",roles:[{name:"销售",remark:"销售角色"}]},
     {name:"本四",roles:[{name:"开发",remark:"开发角色"},{name:"UI",remark:"设计师"}]}
   ]
 }
 * @param obj
 */

jv.param_jmap = function (obj) {
  // var objType = typeof(obj);
  // if (objType == "string") {
  //   return obj;
  // }

  var ret = {};
  Object.keys(obj).forEach(function (key) {
    if (!key) return;
    if (key.endsWith("_res")) {
      return;
    }

    if (key[0] == "_") return;

    var value = obj[key];
    if (value === undefined) return;
    if (value === null) return;

    var isMap = function isMap(mapObject) {
      var isMapValue = mapObject.toString() == "Map";
      if (!isMapValue) {
        if (Object.keys(mapObject).findIndex(function (it) {
          var code = it.charCodeAt();
          if (code >= 65 && code <= 90) return true;
          if (code >= 97 && code <= 122) return true;
          return false;
        }) < 0) {
          isMapValue = true;
        }
      }
      return isMapValue;
    };

    if (Array.isArray(value)) {

      value = value.filter(function (it) {
        return it != undefined && it != null;
      });

      if (value.length == 0) {
        ret[key] = "";
        return;
      }

      var firstType = _typeof(value[0]);
      if (firstType == "string" || firstType == "number") {
        ret[key] = value.join(",");
      }

      for (var i in value) {
        var item = value[i];
        if (jv.isPlainObject(item)) {
          var m = jv.param_jmap(item);
          var keys = Object.keys(m);

          if (isMap(item)) {
            keys.forEach(function (sk) {
              ret[key + "[" + i + "]['" + sk + "']"] = m[sk];
            });
          } else {
            keys.forEach(function (sk) {
              ret[key + "[" + i + "]." + sk] = m[sk];
            });
          }
        }
      }
    } else if (jv.isPlainObject(value)) {
      var m = jv.param_jmap(value);
      var keys = Object.keys(m);

      if (isMap(value)) {
        keys.forEach(function (sk) {
          ret[key + "['" + sk + "']"] = m[sk];
        });
      } else {
        keys.forEach(function (sk) {
          ret[key + "." + sk] = m[sk];
        });
      }
    } else if (value.Type == "date") {
      ret[key] = value.toDateString();
    } else {
      ret[key] = value;
    }
  });

  return ret;
};
jv.param = function (obj) {
  var ret = jv.param_jmap(obj);
  return Object.keys(ret).map(function (it) {
    return encodeURIComponent(it) + "=" + encodeURIComponent(ret[it]);
  }).join("&");
};

//用法： jv.evalExpression({a:{b:[{c:1}]}} , "a.b[0].c")
//返回: {value: 1 , ok: true }
jv.evalExpression = function (obj, path) {
  if (!path) return obj;
  var random = "_eval_expression_" + jv.random();
  jv[random] = obj;
  var ret = {};
  try {
    ret.value = eval("jv['" + random + "']." + path);
    ret.ok = true;
  } catch (e) {
    ret.ok = false;
  }
  delete jv[random];
  return ret;
};

exports.default = jv;
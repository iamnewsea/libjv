"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require("./defineProperty");

//---------------------------------------------
var jv = {};

jv.enumer = function (typeName, json, sep) {
  var ret = { type: typeName };
  if (sep) {
    //枚举三部分： name,value,remark
    Object.keys(json).forEach(function (it) {
      var value = json[it];
      if (!value.value && value.value !== 0) {
        var sepIndex = value.indexOf(sep);
        json[it] = { value: parseInt(value.substr(0, sepIndex)), remark: value.substr(sepIndex + 1) };
      }
    });
  } else {
    var i = -1;
    Object.keys(json).forEach(function (it) {
      var value = json[it];
      i++;
      if (!value.value && value.value !== 0) {
        json[it] = { name: it, value: i, remark: json[it] };
      }
    });
  }

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
      jv.await(delayTime, action, times - 1);
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
    } else if (value.getTypeName() == "date") {
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

//用法： jv.pointObjectValue({a:{b:{c:1}}} , "a.b.c") === 1
jv.pointObjectValue = function (obj, path) {
  if (!path) return obj;
  jv._pointObject_ = obj;
  var ret = eval("jv._pointObject_." + path);
  delete jv._pointObject_;
  return ret;
};

exports.default = jv;
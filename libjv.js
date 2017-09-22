//-------------------------------------------------------------
if (!Node.prototype.addEventListener && Node.prototype.attachEvent) {
  //兼容性添加。
  Object.defineProperty(Node.prototype, "addEventListener", {
    value(event, fn) {
      return this.attachEvent("on" + event, fn);
    }, enumerable: false
  });

  Object.defineProperty(Node.prototype, "removeEventListener", {
    value(event, fn) {
      return this.detachEvent("on" + event, fn);
    }, enumerable: false
  });
}

if (!Element.prototype.closest) {
  //兼容性添加。
}

//格式化日期，将毫秒数转化为日期时间
Object.defineProperty(Number.prototype, "toDateString", {
  value(format) {
    if (!this) return "";
    format = format || "yyyy-MM-dd HH:mm:ss";
    var time = this;
    var t = new Date(time);
    var tf = function (i) {
      return (i < 10 ? '0' : '') + i
    };
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
      switch (a) {
        case 'yyyy':
          return tf(t.getFullYear());
          break;
        case 'MM':
          return tf(t.getMonth() + 1);
          break;
        case 'mm':
          return tf(t.getMinutes());
          break;
        case 'dd':
          return tf(t.getDate());
          break;
        case 'HH':
          return tf(t.getHours());
          break;
        case 'ss':
          return tf(t.getSeconds());
          break;
      }
    })
  }, enumerable: false
});


Object.defineProperty(Array.prototype, "spliceDate", {
  value() {

    if (this.length == 0) return [];
    return this.map(it => {
      if (!it) return it;
      return it.valueOf().toDateString();
    });
  }
  , enumerable: false
});

String.prototype.ori_trim = String.prototype.trim;

Object.defineProperty(String.prototype, 'trim', {
  value() {
    var ps = arguments;

    var value = this.ori_trim();
    if (ps.length == 0) {
      return value;
    }

    if (ps.length == 1 && (typeof( ps[0]) != "string") && ps[0].length) {
      ps = ps[0];
    }

    var hit = false;
    for (var i = 0, len = ps.length; i < len; i++) {
      var hit_inner = false;
      var v = ps[i];
      if (value.startsWith(v)) {
        value = value.slice(v.length).ori_trim();
        hit_inner = true;
      }

      if (value.endsWith(v)) {
        value = value.slice(0, 0 - v.length).ori_trim();
        hit_inner = true;
      }

      hit = hit_inner || hit;
      if (hit_inner) {
        i--;
      }
    }

    if (hit) {
      return value.trim(ps);
    }
    else return value;
  }, enumerable: false
});

Object.defineProperty(String.prototype, 'findIndex', {
  value() {
    //第一个是 action , 第二个是 index.
    var action = arguments[0], startIndex = arguments[1] || 0;
    for (len = this.length; startIndex < len; startIndex++) {
      if (action(this[startIndex], startIndex) === true) return startIndex;
    }
    return -1;
  }, enumerable: false
});

Object.defineProperty(Number.prototype, 'format', {
  value() {
    //"000.00" 只接收 0 和一个点。
    var ps = arguments;
    if (ps.length == 0) {
      return value;
    }
    // if (ps.length == 1 && (typeof(ps[0]) != "string") && ps[0].length) {
    //   ps = ps[0];
    // }


    var formatValue = ps[0],
        dotIndex = -1;

    //第一位，要么是0,要么是点。
    var zero1Index = formatValue.indexOf("0");
    if (zero1Index < 0) {
      return this.toString();
      ;
    }
    else if (zero1Index == 0) {
      dotIndex = formatValue.indexOf(".");

    }
    else if (formatValue[0] == ".") {
      dotIndex = 0;
    }
    else {
      return this.toString();
    }

    //点或0前面的位置
    var beforeMustLength = 0,
        endMustLength = dotIndex < 0 ? 0 : formatValue.length - dotIndex - 1,
        vs = this.toString().split(".");

    if (dotIndex < 0) {
      beforeMustLength = formatValue.length;
    }
    else if (dotIndex > zero1Index) {
      beforeMustLength = dotIndex - zero1Index;
    }

    vs[1] = vs[1] || "";

    var ret = "";

    for (var i = 0, len = beforeMustLength - vs[0].length; i < len; i++) {
      ret += "0";
    }
    ret += vs[0];
    if (dotIndex >= 0) {
      ret += ".";
    }
    if (endMustLength > 0) {
      ret += vs[1].slice(0, endMustLength);

      for (var i = 0, len = endMustLength - vs[1].length; i < len; i++) {
        ret += "0";
      }
    }
    return ret;
  }, enumerable: false
});


/*
 obj.defEnum("sex",jv.SexEnum)
 data.sex_res == "男"
 */
Object.defineProperty(Object.prototype, "defEnum", {
  value(key, enumDef, override) {
    var obj = this;
    var p = obj[key];
    var v = enumDef.getData(p.toString());
    if (!v) {
      return;
    }
    if (override) {
      obj[key] = v.remark || "";
    }
    else {
      obj[key + "_res"] = v.remark || "";
    }
  }, enumerable: false
});


Object.defineProperty(Object.prototype, "regEnum", {
  value(enumDef) {
    this.$set(this, enumDef.type, enumDef.getData())
  }, enumerable: false
});

Object.defineProperty(Array.prototype, "last", {
  value() {
    if (!this.length) return null;
    return this[this.length - 1];
  }, enumerable: false
});

Object.defineProperty(Array.prototype, "putDistinct", {
  value(val, filterFunc) {
    if (filterFunc) {
      if (this.filter(val, filterFunc)) {
        return;
      }

      if (this.indexOf(val) >= 0) {
        return;
      }
    }
    this.push(val);
  }, enumerable: false
});

Object.defineProperty(Array.prototype, "distinct", {
  value(idFunc) {
    var ret = {};

    this.forEach(it => {
      ret[idFunc ? idFunc(it) : it] = it;
    })

    return Object.values(ret);
  }, enumerable: false
});

// Object.defineProperty(Array.prototype, "reSplice", {
//   value() {
//     this.splice.apply(this, [0, this.length].concat(this));
//   }, enumerable: false
// });
//交换两项的位置
Object.defineProperty(Array.prototype, "swap", {
  value(index1, index2) {
    this[index1] = this.splice(index2, 1, this[index1])[0];
    return this;
  }
});
//大于等于 and 小于等于
Object.defineProperty(Object.prototype, "between", {
  value(start, end) {
    if (start > end) {
      var t = start;
      start = end;
      end = t;
    }

    if (this < start) return false;
    if (this > end) return false;
  }, enumerable: false
});

//如果回调返回 false , 则返回false. 全部没有命中，则返回 true
//action参数：自己，父节点，自己在父节点的索引
Object.defineProperty(Array.prototype, "recursion", {
  value(subCallback, action) {
    for (var i = 0, len = this.length; i < len; i++) {
      var item = this[i];
      if (action(item, i) === false) return false;
      var subItems = subCallback(item);
      if (subItems && subItems.length) {
        if (subItems.recursion(subCallback, action) === false) return false;
      }
    }
    return true;
  }, enumerable: false
});

//可以push Array，及Set
Object.defineProperty(Set.prototype, "push", {
  value(value) {
    if (value instanceof Set) {
      value = Array.from(value);
    }
    for (var i = 0, len = value.length; i < len; i++) {
      this.add(value[i]);
    }
    return this.size;
  }, enumerable: false
});
//参数是 Json 的 format。参数： json , 如果没有数据是否设置为空 (true置空，false保留模板值)，左标志符，右标志符。
Object.defineProperty(String.prototype, 'format', {
  value() {
    var json = arguments[0];
    var setEmptyifNo = arguments[1] || false;
    var left = arguments[2] || "{", right = arguments[3] || "}"

    return this
        .replace(left + left, String.fromCharCode(7), "g")
        .replace(right + right, String.fromCharCode(8), "g")
        .replace(new RegExp(left + "(\\w+)" + right, "g"),
            //m 是指搜索到的整个部分， 如： {id} , 而 i  是指 该部分的分组内容 ， 如 id
            function (m, i) {
              if (i in json) {
                var value = json[i];
                if (value || (value === 0) || ( value === false)) {
                  return value;
                }
                else {
                  return "";
                }
              }
              else if (setEmptyifNo) return "";
              else return m;
            })
        .replace(String.fromCharCode(7), left, "g")
        .replace(String.fromCharCode(8), right, "g")
        ;
  }, enumerable: false
});


document.cookieMap = (function () {
  // http://blog.csdn.net/lvjin110/article/details/37663067
  var language = navigator.language || navigator.browserLanguage;
  navigator.languageCode = "cn";

  if (language.indexOf("zh") < 0) {
    navigator.languageCode = "en";
  }

  var db = {};

  (document.cookie || "").split(";").forEach(it => {
    var sect = it.split("=");
    db[sect[0].trim()] = decodeURIComponent((sect[1] || "").trim());
  });

  return {
    get: function (key) {
      if (!key) return db;
      return db[key];
    }
    , set: function (key, value, cacheTime) {
      key = key.trim();
      value = encodeURIComponent(value.trim() || "");
      db[key] = value;

      var expires = "";
      if (cacheTime) {
        var exp = new Date();
        exp.setTime(exp.getTime() + cacheTime * 1000);
        expires = ";expires=" + exp.toGMTString()
      }
      document.cookie = key + "=" + value + ";path=/" + expires;
    }
    , remove: function (key) {
      this.set(key, "", -1);
    }
  };
})();

var jv = {};


jv.enumer = function (typeName, json, sep) {
  var ret = {type: typeName};
  if (sep) {
    //枚举三部分： name,value,remark
    Object.keys(json).forEach(it => {
      var value = json[it];
      if (!value.value && (value.value !== 0)) {
        var sepIndex = value.indexOf(sep);
        json[it] = {value: parseInt(value.substr(0, sepIndex)), remark: value.substr(sepIndex + 1)};
      }
    })
  }
  else {
    var i = -1;
    Object.keys(json).forEach(it => {
      var value = json[it];
      i++;
      if (!value.value && (value.value !== 0)) {
        json[it] = {name: it, value: i, remark: json[it]};
      }
    })
  }

  ret.getData = function (key) {
    if (key) {
      return json[key];
    }
    return Object.keys(json).map(it => {
      return json[it];
    });
  }

  jv[typeName] = ret;
  return ret;
}

jv.isPlainObject = function (obj) {
  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if (!obj || ({}).toString.call(obj) !== "[object Object]") {
    return false;
  }
  return true;
}

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
jv.forDelay = function (delayTime, action, times) {
  times = times || 100;

  if (times == 1) {
    return;
  }

  if (action() !== false) {
    return setTimeout(() => {
      jv.forDelay(delayTime, action, times - 1);
    }, delayTime);
  }
}


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
  Object.keys(obj).forEach(key => {
    if (!key) return;
    if (key.endsWith("_res")) {
      return;
    }

    if (key[0] == "_") return;

    var value = obj[key];
    if (value === undefined) return;
    if (value === null) return;

    var isMap = function (mapObject) {
      var isMapValue = mapObject.toString() == "Map";
      if (!isMapValue) {
        if (Object.keys(mapObject).findIndex(it => {
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

      value = value.filter(it => it != undefined && it != null);

      if (value.length == 0) {
        ret[key] = "";
        return;
      }

      var firstType = typeof(value[0]);
      if (firstType == "string" || firstType == "number") {
        ret[key] = value.join(",");
      }

      for (var i in value) {
        var item = value[i];
        if (jv.isPlainObject(item)) {
          var m = jv.param_jmap(item);
          var keys = Object.keys(m);

          if (isMap(item)) {
            keys.forEach(sk => {
              ret[key + "[" + i + "]['" + sk + "']"] = m[sk];
            })
          } else {
            keys.forEach(sk => {
              ret[key + "[" + i + "]." + sk] = m[sk];
            })
          }
        }
      }
    }
    else if (jv.isPlainObject(value)) {
      var m = jv.param_jmap(value);
      var keys = Object.keys(m);

      if (isMap(value)) {
        keys.forEach(sk => {
          ret[key + "['" + sk + "']"] = m[sk];
        })
      }
      else {
        keys.forEach(sk => {
          ret[key + "." + sk] = m[sk];
        })
      }
    }
    else if (value instanceof Date) {
      ret[key] = value.toDateString();
    }
    else {
      ret[key] = value;
    }
  })

  return ret;
}
jv.param = function (obj) {
  var ret = jv.param_jmap(obj);
  return Object.keys(ret).map(it => {
    return encodeURIComponent(it) + "=" + encodeURIComponent(ret[it])
  }).join("&");
}

export default jv;
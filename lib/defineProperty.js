"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//-------------------------------------------------------------
//返回 function ,string 等实际类名。
Object.defineProperty(Object.prototype, "Type", {
  get: function get() {
    var ret = this.constructor.name || _typeof(this);
    //把第一个非大写字母前面的全部变成小写字母。

    if (ret) {
      var index = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ret[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var it = _step.value;

          var code = it.charCodeAt();
          if (code >= 65 && code <= 90) {
            index++;
          } else {
            break;
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

      if (index) {
        if (index > 1) {
          index--;
        }
        ret = ret.slice(0, index).toLocaleLowerCase() + ret.slice(index);
      }
    }

    return ret;
  },
  enumerable: false
});

Date.from = function (year, dates) {
  return new Date(new Date(year + "/01/01").valueOf() + (dates - 1) * 86400000);
};

Date.today = function () {
  var now = new Date();
  return new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate() + " 00:00:00");
};
if (!Node.prototype.addEventListener && Node.prototype.attachEvent) {
  //兼容性添加。
  Object.defineProperty(Node.prototype, "addEventListener", {
    value: function value(event, fn) {
      return this.attachEvent("on" + event, fn);
    }, enumerable: false
  });

  Object.defineProperty(Node.prototype, "removeEventListener", {
    value: function value(event, fn) {
      return this.detachEvent("on" + event, fn);
    }, enumerable: false
  });
}

if (!Element.prototype.closest) {
  //兼容性添加。
}

Object.defineProperty(Date.prototype, "toDateString", {
  value: function value(format) {
    return this.valueOf().toDateString(format);
  }, enumerable: false
});

//格式化日期，将毫秒数转化为日期时间
Object.defineProperty(Number.prototype, "toDateString", {
  value: function value(format) {
    if (!this) return "";
    format = format || "yyyy-MM-dd HH:mm:ss";
    var time = this;
    var t = new Date(time);
    var tf = function tf(i) {
      return (i < 10 ? '0' : '') + i;
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
    });
  },
  enumerable: false
});

Object.defineProperty(Date.prototype, "addDays", {
  value: function value(days) {
    if (!days) return this;
    return new Date(this.valueOf() + days * 86400000);
  },
  enumerable: false
});

//获取时间的毫秒数
Object.defineProperty(Date.prototype, "Time", {
  get: function get() {
    return this.getHours() * 3600000 + this.getMinutes() * 60000 + this.getSeconds() * 1000 + this.getMilliseconds();
  },
  enumerable: false
});
//一年的第几天。
Object.defineProperty(Date.prototype, "DayOfYear", {
  get: function get() {
    var ret = (this.valueOf() - new Date(this.getFullYear() + "/01/01").valueOf()) / 86400000;
    return parseInt(ret) + 1;
  },
  enumerable: false
});

Object.defineProperty(Array.prototype, "spliceDate", {
  value: function value() {
    if (this.length == 0) return [];
    return this.map(function (it) {
      if (!it) return it;
      return it.valueOf().toDateString();
    });
  },
  enumerable: false
});

String.prototype.ori_trim = String.prototype.trim;

Object.defineProperty(String.prototype, 'trim', {
  value: function value() {
    var ps = arguments;

    var value = this.ori_trim();
    if (ps.length == 0) {
      return value;
    }

    if (ps.length == 1 && typeof ps[0] != "string" && ps[0].length) {
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
    } else return value;
  },
  enumerable: false
});

Object.defineProperty(String.prototype, 'findIndex', {
  value: function value() {
    //第一个是 action , 第二个是 index.
    var action = arguments[0],
        startIndex = arguments[1] || 0;
    for (var len = this.length; startIndex < len; startIndex++) {
      if (action(this[startIndex], startIndex) === true) return startIndex;
    }
    return -1;
  },
  enumerable: false
});

Object.defineProperty(Number.prototype, 'format', {
  value: function (_value) {
    function value() {
      return _value.apply(this, arguments);
    }

    value.toString = function () {
      return _value.toString();
    };

    return value;
  }(function () {
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
    } else if (zero1Index == 0) {
      dotIndex = formatValue.indexOf(".");
    } else if (formatValue[0] == ".") {
      dotIndex = 0;
    } else {
      return this.toString();
    }

    //点或0前面的位置
    var beforeMustLength = 0,
        endMustLength = dotIndex < 0 ? 0 : formatValue.length - dotIndex - 1,
        vs = this.toString().split(".");

    if (dotIndex < 0) {
      beforeMustLength = formatValue.length;
    } else if (dotIndex > zero1Index) {
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
  }),
  enumerable: false
});

//获取整数的每一个二进制位的值。
Object.defineProperty(Number.prototype, 'EachBitValue', {
  get: function get() {
    var ret = [];
    var value = parseInt(this);
    var position = 0;
    while (true) {
      if (!value) break;
      if (value & 1) {
        ret.push(Math.pow(2, position));
      }

      value = value >> 1;
      position++;
    }
    return ret;
  },
  enumerable: false
});

/*
 obj.Enumer("sex",jv.SexEnum)
 data.sex_res == "男"
 */
Object.defineProperty(Object.prototype, "Enumer", {
  value: function value(key, enumDef, override) {
    var obj = this;
    var p = obj[key];
    var v = enumDef.getData(p.toString());
    if (!v) {
      return;
    }
    if (override) {
      obj[key] = v.remark || "";
    } else {
      obj[key + "_res"] = v.remark || "";
    }
  },
  enumerable: false
});

// Object.defineProperty(Object.prototype, "RegEnum", {
//   value(enumDef) {
//     this.$set(this, enumDef.type, enumDef.getData())
//   }, enumerable: false
// });

Object.defineProperty(Array.prototype, "last", {
  value: function value(filter) {
    if (!this.length) return null;
    if (filter) {
      for (var i = this.length - 1; i > -1; i--) {
        if (filter(this[i])) return this[i];
      }
      return null;
    }
    return this[this.length - 1];
  },
  enumerable: false
});

Object.defineProperty(Array.prototype, "putDistinct", {
  value: function value(val, filterFunc) {
    if (filterFunc) {
      if (this.filter(val, filterFunc)) {
        return;
      }
    } else if (this.indexOf(val) >= 0) {
      return;
    }

    this.push(val);
  },
  enumerable: false
});

Object.defineProperty(Array.prototype, "distinct", {
  value: function value(idFunc) {
    var ret = {};

    this.forEach(function (it) {
      ret[idFunc ? idFunc(it) : JSON.stringify(it)] = it;
    });

    return Object.values(ret);
  },
  enumerable: false
});

// Object.defineProperty(Array.prototype, "reSplice", {
//   value() {
//     this.splice.apply(this, [0, this.length].concat(this));
//   }, enumerable: false
// });
//交换两项的位置
Object.defineProperty(Array.prototype, "swap", {
  value: function value(index1, index2) {
    this[index1] = this.splice(index2, 1, this[index1])[0];
    return this;
  }
});
//大于等于 and 小于等于
Object.defineProperty(Object.prototype, "Between", {
  value: function value(start, end) {
    if (start > end) {
      var t = start;
      start = end;
      end = t;
    }

    if (this < start) return false;
    if (this > end) return false;
  },
  enumerable: false
});

/** 递归一个数组:
 * @param subCallback, 每一项包含子项的回调.
 * @param action 参数:自己,父节点,自己在父节点的索引.每一项的回调. 如果返回false,则停止 , 如果返回 null,则停止子项.
 */
Object.defineProperty(Array.prototype, "recursion", {
  value: function value(subCallback, action) {
    var r;
    for (var i = 0, len = this.length; i < len; i++) {
      var item = this[i];
      var r = action(item, i);
      if (r === false) return false;
      if (r === null) continue;
      var subItems = subCallback(item);
      if (subItems && subItems.length) {
        if (subItems.recursion(subCallback, action) === false) return false;
      }
    }
    return true;
  },
  enumerable: false
});

/**
 * 把数组的数组,解开合成一个数组.
 */
Object.defineProperty(Array.prototype, "unwind", {
  value: function value() {
    var ret = [];
    this.forEach(function (wai) {
      wai.forEach(function (it) {
        ret.push(it);
      });
    });
    return ret;
  },
  enumerable: false
});
//可以push Array，及Set
Object.defineProperty(Set.prototype, "push", {
  value: function (_value2) {
    function value(_x) {
      return _value2.apply(this, arguments);
    }

    value.toString = function () {
      return _value2.toString();
    };

    return value;
  }(function (value) {
    if (value && value.Type == "set") {
      value = Array.from(value);
    }
    for (var i = 0, len = value.length; i < len; i++) {
      this.add(value[i]);
    }
    return this.size;
  }),
  enumerable: false
});
//参数是 Json 的 format。参数： json , 如果没有数据是否设置为空 (true置空，false保留模板值)，左标志符，右标志符。
Object.defineProperty(String.prototype, 'format', {
  value: function value() {
    var json = arguments[0];
    var setEmptyifNo = arguments[1] || false;
    var left = arguments[2] || "{",
        right = arguments[3] || "}";

    return this.replace(left + left, String.fromCharCode(7), "g").replace(right + right, String.fromCharCode(8), "g").replace(new RegExp(left + "(\\w+)" + right, "g"),
    //m 是指搜索到的整个部分， 如： {id} , 而 i  是指 该部分的分组内容 ， 如 id
    function (m, i) {
      if (i in json) {
        var value = json[i];
        if (value || value === 0 || value === false) {
          return value;
        } else {
          return "";
        }
      } else if (setEmptyifNo) return "";else return m;
    }).replace(String.fromCharCode(7), left, "g").replace(String.fromCharCode(8), right, "g");
  },
  enumerable: false
});

document.cookieMap = function () {
  // http://blog.csdn.net/lvjin110/article/details/37663067
  var language = navigator.language || navigator.browserLanguage;
  navigator.languageCode = "cn";

  if (language.indexOf("zh") < 0) {
    navigator.languageCode = "en";
  }

  var db = {};

  (document.cookie || "").split(";").forEach(function (it) {
    var sect = it.split("=");
    db[sect[0].trim()] = decodeURIComponent((sect[1] || "").trim());
  });

  return {
    get: function get(key) {
      if (!key) return db;
      return db[key];
    },
    set: function set(key, value, cacheTime) {
      key = key.trim();
      value = encodeURIComponent(value.trim() || "");
      db[key] = value;

      var expires = "";
      if (cacheTime) {
        var exp = new Date();
        exp.setTime(exp.getTime() + cacheTime * 1000);
        expires = ";expires=" + exp.toGMTString();
      }
      document.cookie = key + "=" + value + ";path=/" + expires;
    },
    remove: function remove(key) {
      this.set(key, "", -1);
    }
  };
}();

document.location.json = function () {
  // http://blog.csdn.net/lvjin110/article/details/37663067

  var ret = {};
  location.search.slice(1).split("&").forEach(function (it) {
    var sects = it.split("=");
    ret[sects[0]] = sects[1];
  });
  return ret;
}();
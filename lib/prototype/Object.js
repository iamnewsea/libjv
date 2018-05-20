"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//-------------------------------------------------------------
//返回 function ,string 等实际类名。
Object.defineProperty(Object.prototype, "Type", {
  get: function get() {
    if (this.__type__) {
      return this.__type__;
    }

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

    this.__type__ = ret;

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
    if (key in obj == false) {
      throw new Error("找不到 " + key + " 属性(" + enumDef.type + ")");
    }
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
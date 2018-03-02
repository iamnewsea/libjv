"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vueInit = require("./vue-init");

var _vueInit2 = _interopRequireDefault(_vueInit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// jv.chk_show = function (dom, msg) {
//   //dom.addClass("chk-error");
//   jv.error(msg);
// }

_vueInit2.default.chk_show = function (chk_msg, inputDom, dom) {
  var tip = dom.popTip(chk_msg);
  if (chk_msg) {
    var chkMsgOffset = dom.dataset.chkMsgOffset || dom.getAttribute("chk-msg-offset");
    if (chkMsgOffset) {
      chkMsgOffset = inputDom.closest(chkMsgOffset);

      if (!chkMsgOffset) {
        chkMsgOffset = inputDom;
      }
    } else {
      chkMsgOffset = inputDom;
    }
    tip.style.marginLeft = (chkMsgOffset.offset_pdom(dom).x || 0) + "px";
  }
};

//如果返回字符串，则为验证消息， 另外返回布尔值，表示是否通过验证。
_vueInit2.default.chk_range = function (chk_type, chk_body, value) {
  chk_body = chk_body.trim();

  var getNextCharIndex = function getNextCharIndex(exp, char, startIndex) {
    for (var i = startIndex || 0, len = exp.length; i < len; i++) {
      if (exp[i] == char) return i;
    }
    return -1;
  };

  //{value.length}(1,4] & ( {value[0]}[3,3] | {value[1]}[5,5] )
  //{}表示表达式，后面接着 (] 表示区间。 中间用 & | 连接。
  if (chk_body[0] == "{") {
    var valueRangeIndex = getNextCharIndex(chk_body, "}");
    if (valueRangeIndex < 0) {
      return "[Error]:表达式" + chk_body + "缺少 }";
    }
    value = eval("(value) => { return  " + chk_body.slice(1, valueRangeIndex) + "}")(value);

    chk_body = chk_body.slice(valueRangeIndex + 1);
  }

  chk_body = chk_body.trim();

  if (chk_body[0] != '(' && chk_body[0] != '[') {
    return "[Error]:表达式" + chk_body + "非法";
  }
  if (chk_body[chk_body.length - 1] != ')' && chk_body[chk_body.length - 1] != ']') {
    return "[Error]:表达式" + chk_body + "非法";
  }

  var range = chk_body.slice(1, chk_body.length - 1).split(",").map(function (it) {
    return it.trim();
  });

  if (chk_type == "enum") {
    return range.indexOf(value) >= 0;
  }

  if (chk_body[0] == '(' && value <= range[0]) {
    return false;
  } else if (chk_body[0] == "[" && value < range[0]) {
    return false;
  } else if (range.length > 1) {
    var lastSign = chk_body[chk_body.length - 1],
        lastValue = range[1];
    if (lastSign == ")" && value >= lastValue) {
      return false;
    } else if (lastSign == "]" && value > lastValue) {
      return false;
    }
  }

  return true;
};
_vueInit2.default.chk_types = {
  "float": function float(chk_body, value, inputDom) {
    return (/^[+-]?[0-9]+.?[0-9]*$/.test(value)
    );
  },
  "int": function int(chk_body, value, inputDom) {
    return (/^[+-]?[0-9]+$/.test(value)
    );
  },
  "date": function date(chk_body, value, inputDom) {
    return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1])$/.test(value)
    );
  },
  "date-time": function dateTime(chk_body, value, inputDom) {
    return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1]) ([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(value)
    );
  },
  "time": function time(chk_body, value, inputDom) {
    return (/^([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(value)
    );
  },
  "email": function email(chk_body, value, inputDom) {
    return (/^([\w-])+@([\w-])+(\.[\w-]{1,})$/.test(value)
    );
  },
  //*号必填
  "*": function _(chk_body, value, inputDom) {
    if (!value.length) {
      return "必填";
    }
    return true;
  },
  //文本类型，返回 true,可空.
  "": function _() {
    return true;
  }

  //校验器
  /**
   * chk="reg:/^[+-]?[0-9]+$/"
   * chk="int"
   * chk="int{value.length}(3,4]"
   * chk="{value}[10,99]"
   * chk=": if( value.length < 3) return '长度必须大于3'"
   *
   * chk格式：
   * :回调
   * reg:表达式
   * chk_type{value表达式}(开始值，结束值)
   *
   *
   * 判断方法：按非字符,拆分出： chk_type
   * 1. 冒号开头
   * 2. chk_type == "reg"
   * 3. chk_type 有对应。
   * 特殊的chk_type: reg , function
   */
};Object.defineProperty(HTMLElement.prototype, "chk", {
  //chk_show:如何显示的回调.
  value: function value(chk_show) {

    //
    var getInputDom = function getInputDom(dom) {
      if (dom.tagName == "INPUT") {
        return dom;
      }
      if (dom.tagName == "TEXTAREA") {
        return dom;
      }

      if (dom.childNodes.length == 0) return "";

      var domInput = dom.querySelector("input[type=hidden]");
      if (!domInput) {
        domInput = dom.querySelector("input");
      }
      if (!domInput) {
        domInput = dom.querySelector("textarea");
      }

      if (!domInput) {
        return null;
      }

      return getInputDom(domInput);
    };

    var getInputValue = function getInputValue(dom) {
      if (!dom.tagName) {
        return null;
      }

      if (dom.tagName == "INPUT" || dom.tagName == "TEXTAREA") {
        return dom.value;
      }

      var ret;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = dom.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          ret = getInputValue(item);
          if (ret) {
            return ret;
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

      return null;
    };

    //查找dom下第一个绑定 v-model 的值.如果找不到,则查找 inputDom 的值.
    var getVModelValue = function getVModelValue(component) {
      var vdata = component.$vnode.data,
          ret;
      if (vdata && vdata.model && vdata.model.expression) {
        //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
        ret = _vueInit2.default.evalExpression(component.$vnode.context._data, vdata.model.expression);
        if (ret.ok) {
          return ret.value;
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = component.$children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var it = _step2.value;

          ret = getVModelValue(it);
          if (ret) {
            return ret;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return ret;
    };

    var isValidateChar = function isValidateChar(code) {
      if (code == 45 || code == 95) return true;
      if (code >= 65 && code <= 90) return true;
      if (code >= 97 && code <= 122) return true;
      if (code >= 48 && code <= 57) return true;

      return false;
    };
    //取下一个非字符。 减号下划线除外
    var getNextNonCharIndex = function getNextNonCharIndex(exp) {
      var chk_type_index = Array.from(exp).findIndex(function (it) {
        return !isValidateChar(it.charCodeAt());
      });

      if (chk_type_index < 0) {
        chk_type_index = exp.length;
      }
      return chk_type_index;
    };

    var inputChanged = function inputChanged(e) {
      var inputDom = e.target;
      var chk_dom = inputDom.chk_dom;
      var chk = chk_dom.dataset.chk || chk_dom.getAttribute("chk") || "";
      chk = chk.trim();
      if (!chk) return;

      var chk_msg = "",
          chk_define_msg = "";

      var chk_type_index = getNextNonCharIndex(chk),
          chk_type = chk.slice(0, chk_type_index),
          chk_body;

      if (chk[0] == ':') {
        chk_type = ":";
        chk_body = chk.slice(1);
      } else if (chk_type == "reg") {
        if (chk[chk_type_index] != ':') {
          chk_msg = "[Error]正则表达式缺少冒号";
        }
        chk_body = chk.slice(chk_type_index + 1);
      } else {
        chk_body = chk.slice(chk_type_index);
      }

      var value = getVModelValue(chk_dom.__vue__);
      if (value !== null) {} else {
        value = getInputValue(chk_dom);
      }

      if (value === null) {
        chk_msg = "找不到输入框";
      }

      //如果是类型带着?表示可空.
      if (chk_body[0] == '?') {
        chk_body = chk_body.slice(1);
        if (!value) {
          chk = "";
          chk_type = "";
          chk_body = "";
        }
      }

      if (chk_type != ":") {
        chk_define_msg = chk_dom.dataset.chkMsg || chk_dom.getAttribute("chk-msg") || "";
      }

      if (chk_msg) {} else if (chk_type == ":") {
        chk_msg = eval("(value,dom) => {" + chk_body + "}")(value, inputDom);
      } else if (chk_type == "reg") {
        //如果不是类型，则整体按正则算。
        var reg;
        try {
          reg = eval(chk_body);
          chk_msg = reg.test(value) ? "" : "不符合正则表达式规则";
        } catch (e) {
          chk_msg = "正则表达式不正确";
        }
      } else if (chk) {
        //如果定义了 * 号,表示必填.
        var chk_type2 = Object.keys(_vueInit2.default.chk_types).find(function (it) {
          return chk.startsWith(it);
        }) || "";
        if (chk_type2) {
          chk_type = chk_type2;
          chk_body = chk.slice(chk_type.length + 1).trim();
        }

        if (chk_type in _vueInit2.default.chk_types) {
          var chk_type_ret = _vueInit2.default.chk_types[chk_type](chk_body, value, inputDom, chk_dom);

          if (chk_type_ret === false) {
            chk_msg = "不符合 " + chk_type + " 规范";
          } else if (chk_type_ret === true) {
            chk_msg = "";
          } else {
            chk_msg = chk_type_ret;
          }

          if (!chk_msg && chk_body) {
            // chk_body.split("&")
            chk_msg = _vueInit2.default.chk_range(chk_type, chk_body, value);
          }

          if (chk_msg === true) {
            chk_msg = "";
          } else if (chk_msg === false) {
            chk_msg = "验证失败 " + chk_type;
          }
        } else {
          chk_msg = "[Error]不识别的类型" + chk_type;
        }
      }

      if (chk_msg) {
        chk_msg = chk_define_msg || chk_msg;
      }

      e.chk_msg = chk_msg;
      _vueInit2.default.chk_show(chk_msg, inputDom, chk_dom);

      //即使没有消息,也要调用.使调用方隐藏提示.
      if (chk_show && chk_show(chk_msg, inputDom, chk_dom) === false) {
        e.chk_return_value = false;
        return;
      }
    };
    //

    var ret = true,
        list = Array.from(this.querySelectorAll("[chk]"));
    list = list.concat(Array.from(this.querySelectorAll("[data-chk]")));

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var chk_dom = _step3.value;

        var inputDom = getInputDom(chk_dom);
        if (!inputDom) continue;

        inputDom.chk_dom = chk_dom;
        inputDom.removeEventListener("blur", inputChanged);
        inputDom.addEventListener("blur", inputChanged);

        //Chrome

        //可以通过 ev 传值。
        var ev = inputDom.trigger("blur");
        ret = !ev.chk_msg && ret;
        if (ev.chk_return_value === false) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return ret;
  }, enumerable: false
});

exports.default = _vueInit2.default;
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
    tip.style.marginLeft = dom.offsetWidth - inputDom.offsetWidth + "px";
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
    if (chk_body[chk_body.length - 1] == ")" && value >= range[range.length - 1]) {
      return false;
    } else if (chk_body[chk_body.length - 1] == "]" && value > range[range.length - 1]) {
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
  //文本类型，返回 true
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

      var value = "";
      if (inputDom) {
        if (inputDom.tagName == "INPUT" || inputDom.tagName == "TEXTAREA") {
          value = inputDom.value;
        } else {
          value = inputDom.innerHTML;
        }
      }

      if (chk_type != ":") {
        chk_define_msg = chk_dom.dataset.chkMsg || chk_dom.getAttribute("chk-msg") || "";
      }

      if (chk_msg) {} else if (chk_type == ":") {
        chk_msg = eval("(value,dom) => {" + chk_body + "}").call(inputDom, value, inputDom);
      } else if (chk_type == "reg") {
        //如果不是类型，则整体按正则算。
        chk_msg = eval(chk_body).test(value) ? "" : chk_define_msg;
      } else if (_vueInit2.default.chk_types[chk_type]) {
        if (_vueInit2.default.chk_types[chk_type](chk_body, value, inputDom, chk_dom) == false) {
          chk_msg = chk_define_msg || "不符合 " + chk_type + " 规范";
        } else {
          if (chk_body) {
            // chk_body.split("&")
            chk_msg = _vueInit2.default.chk_range(chk_type, chk_body, value);

            if (chk_msg === true) {
              chk_msg = "";
            } else if (chk_msg === false) {
              chk_msg = chk_define_msg;
            }
          }
        }
      } else {
        chk_msg = "[Error]不识别的类型" + chk_type;
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

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var chk_dom = _step.value;

        var inputDom = getInputDom(chk_dom);
        if (!inputDom) continue;

        inputDom.chk_dom = chk_dom;
        inputDom.removeEventListener("blur", inputChanged);
        inputDom.addEventListener("blur", inputChanged);

        //Chrome
        if (document.createEvent) {
          //可以通过 ev 传值。
          var ev = document.createEvent("HTMLEvents");
          ev.initEvent("blur", true, true);
          inputDom.dispatchEvent(ev);

          ret = !ev.chk_msg && ret;
          if (ev.chk_return_value === false) {
            break;
          }
        }
        //IE
        else {
            var ev = document.createEventObject();
            inputDom.fireEvent("onblur", ev);

            ret = !!ev.chk_msg && ret;
            if (ev.chk_return_value === false) {
              break;
            }
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

    return ret;
  }, enumerable: false
});

exports.default = _vueInit2.default;
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

_vueInit2.default.chk_range = function (chk_type, chk_body, value) {
  chk_body = chk_body.trim();

  var getNextCharIndex = function getNextCharIndex(exp, char, startIndex) {
    for (var i = startIndex, len = exp.length; i < len; i++) {
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
    value = eval("(value) => { return  " + chk_body.slice(1, valueRangeIndex - 1) + "}")(value);

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

  if (chk_body[0] == '(' && range[0] <= value) {
    return false;
  } else if (chk_body[0] == "[" && range[0] < value) {
    return false;
  } else if (range.length > 1) {
    if (chk_body[chk_body.length - 1] == ")" && range[chk_body.length - 1] >= value) {
      return false;
    } else if (chk_body[chk_body.length - 1] == "]" && range[chk_body.length - 1] > value) {
      return false;
    }
  }

  return true;
};
_vueInit2.default.chk_types = {
  "float": function float(chk_body, value, inputDom) {
    if (value === 0) return true;
    if (!value) return false;
    var ret = parseFloat(value);
    if (ret == NaN) return false;
    return true;
  },
  "int": function int(chk_body, value, inputDom) {
    if (value === 0) return true;
    if (!value) return false;
    var ret = parseInt(value);
    if (ret == NaN) return false;
    return true;
  },
  //表示字符串
  "": function _(chk_body, value, dom) {}

  //校验器
};Object.defineProperty(HTMLElement.prototype, "chk", {
  //chk_show:如何显示的回调.
  value: function value(chk_show) {
    var self = this;
    if (!chk_show) {
      console.log("需要参数 chk_show");
      return false;
    }
    // this.getElementsByClassName("chk-error").removeClass("chk-error")
    var list = Array.from(this.querySelectorAll("[chk]"));
    list = list.concat(Array.from(this.querySelectorAll("[data-chk]")));

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        var inputDom = getInputDom(item);
        if (!inputDom) continue;

        inputDom.chk_dom = item;

        //取下一个非字符。 减号下划线除外
        var getNextNonCharIndex = function getNextNonCharIndex(exp) {
          var chk_type_index = Array.from(exp).findIndex(function (it) {
            var code = it.charCodeAt();
            if (code == 45 || code == 95) return true;
            if (code >= 65 && code <= 90) return false;
            if (code >= 97 && code <= 122) return false;
            return true;
          });

          if (chk_type_index < 0) {
            chk_type_index = exp.length;
          }
          return chk_type_index;
        };

        var ch = function ch(e) {
          var inputDom = e.target;
          var item = inputDom.chk_dom;
          var chk = item.dataset.chk || item.getAttribute("chk") || "";
          chk = chk.trim();
          if (chk[0] == '*') {
            chk = chk.slice(1).trim();
          }
          if (!chk) return;

          var chk_type, chk_body;
          if (chk[0] == ':') {
            chk_type = ":";
            chk_body = chk.slice(1);
          } else {
            var chk_type_index = getNextNonCharIndex();

            chk_type = chk.slice(0, chk_type_index);
            chk_body = chk.slice(chk_type_index);
          }

          if (!chk_body) return;

          var value = "";
          if (inputDom) {
            if (inputDom.tagName == "INPUT" || inputDom.tagName == "TEXTAREA") {
              value = inputDom.value;
            } else {
              value = inputDom.innerHTML;
            }
          }

          var chk_msg,
              chk_define_msg = "";
          if (chk_type != ":") {
            chk_define_msg = item.dataset.chkMsg || item.getAttribute("chk-msg") || "";
          }

          if (chk_type == ":") {
            chk_msg = eval("(value,dom) => {" + chk_body + "}").call(inputDom, value, inputDom);
          } else if (_vueInit2.default.chk_types[chk_type]) {
            var index = getNextNonCharIndex(chk_body);
            if (_vueInit2.default.chk_types[chk_type](chk_body.slice(0, index), value, inputDom, item) == false) {
              chk_msg = chk_define_msg || "不符合 " + chk_type + " 规范";
            } else {
              chk_body = chk_body.slice(index);
              // chk_body.split("&")
              chk_msg = _vueInit2.default.chk_range(chk_type, chk_body, value);
            }
          } else {
            //如果不是类型，则整体按正则算。
            chk_msg = new RegExp(chk).test(value) ? "" : chk_define_msg;
          }

          //即使没有消息,也要调用.使调用方隐藏提示.
          if (chk_show(chk_msg, inputDom, item) === false) {
            e.chk_Value = false;
            return;
          }
        };

        inputDom.removeEventListener("blur", ch);
        inputDom.addEventListener("blur", ch);

        //Chrome
        if (document.createEvent) {
          //可以通过 ev 传值。
          var ev = document.createEvent("HTMLEvents");
          ev.initEvent("blur", true, true);
          inputDom.dispatchEvent(ev);

          if (ev.chk_Value === false) {
            break;
          }
        }
        //IE
        else {
            var ev = document.createEventObject();
            inputDom.fireEvent("onblur", ev);

            if (ev.chk_Value === false) {
              break;
            }
          }
        // chk_msg = jv.chk_types[chk_type](chk_body, inputDom, item, this);
        //
        // //即使没有消息,也要调用.使调用方隐藏提示.
        // if (chk_show(chk_msg, inputDom, item) === false) {
        //   break;
        // }
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

    return !!chk_msg;
  }, enumerable: false
});

exports.default = _vueInit2.default;
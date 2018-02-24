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

var chk_length = function chk_length() {};

_vueInit2.default.chk_types = {
  "int": function int(chk_body, inputDom) {},
  "enum": function _enum(chk_body, inputDom) {},
  ":": function _(chk_body, inputDom) {
    chk_body = chk_body.trim();
    if (!chk_body) return;

    var value = "";
    if (inputDom) {
      if (inputDom.tagName == "INPUT" || inputDom.tagName == "TEXTAREA") {
        value = inputDom.value;
      } else {
        value = inputDom.innerHTML;
      }
    }
    return eval("(value,dom) => {" + chk_body + "}").call(inputDom, value);
  },
  "": function _(chk_body, dom) {}

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

    var chk_msg;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        var chk = item.dataset.chk || item.getAttribute("chk") || "";
        chk = chk.trim();
        if (chk[0] == '*') {
          chk = chk.slice(1).trim();
        }
        if (!chk) continue;

        var chk_type_index = Array.from(chk).findIndex(function (it) {
          var code = it.charCodeAt();
          if (code >= 65 && code <= 90) return false;
          if (code >= 97 && code <= 122) return false;
          return true;
        });

        if (chk_type_index < 0) {
          chk_type_index = chk.length;
        }

        var chk_type, chk_body;
        if (chk[0] == ':') {
          chk_type = ":";
          chk_body = chk.slice(1);
        } else {
          chk_type = chk.slice(0, chk_type_index);
          chk_body = chk.slice(chk_type_index);
        }

        var inputDom = getInputDom(item);
        if (!inputDom) continue;
        chk_msg = _vueInit2.default.chk_types[chk_type](chk_body, inputDom, item, this);

        //即使没有消息,也要调用.使调用方隐藏提示.
        if (chk_show(chk_msg, inputDom, item) === false) {
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

    return !!chk_msg;
  }, enumerable: false
});

exports.default = _vueInit2.default;
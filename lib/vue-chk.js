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

var getDomValue = function getDomValue(dom) {
  if (dom.tagName == "INPUT") {
    return this.value;
  }
  if (dom.tagName == "TEXTAREA") {
    return this.value;
  }
  return this.innerHTML;
};

var chk_length = function chk_length() {};

_vueInit2.default.chk_types = {
  "int": function int(chk_body, dom) {},
  "enum": function _enum(chk_body, dom) {},
  ":": function _(chk_body, dom) {
    return eval(" value => " + chk_body).call(dom, getDomValue(dom));
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

    var ret = {},
        chk_msg;
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

        chk_msg = _vueInit2.default.chk_types[chk_type](chk_body, this);
        if (chk_msg) {
          ret[item] = chk_msg;
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

    Object.keys(ret).forEach(function (it) {
      chk_msg = ret[it];
      chk_show(it, chk_msg);
    });

    return !!chk_msg;
  }, enumerable: false
});

exports.default = _vueInit2.default;
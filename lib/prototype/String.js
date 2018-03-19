'use strict';

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
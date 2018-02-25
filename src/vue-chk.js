import jv from "./vue-init"

// jv.chk_show = function (dom, msg) {
//   //dom.addClass("chk-error");
//   jv.error(msg);
// }

var getInputDom = function (dom) {
  if (dom.tagName == "INPUT") {
    return dom;
  }
  if (dom.tagName == "TEXTAREA") {
    return dom;
  }

  if (dom.childNodes.length == 0) return "";

  var domInput = dom.querySelector("input[type=hidden]")
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
}

//如果返回字符串，则为验证消息， 另外返回布尔值，表示是否通过验证。
jv.chk_range = function (chk_type, chk_body, value) {
  chk_body = chk_body.trim();

  var getNextCharIndex = function (exp, char, startIndex) {
    for (var i = startIndex || 0, len = exp.length; i < len; i++) {
      if (exp[i] == char) return i;
    }
    return -1;
  }

  //{value.length}(1,4] & ( {value[0]}[3,3] | {value[1]}[5,5] )
  //{}表示表达式，后面接着 (] 表示区间。 中间用 & | 连接。
  if (chk_body[0] == "{") {
    var valueRangeIndex = getNextCharIndex(chk_body, "}");
    if (valueRangeIndex < 0) {
      return "[Error]:表达式" + chk_body + "缺少 }";
    }
    value = eval("(value) => { return  " + chk_body.slice(1, valueRangeIndex) + "}")(value)

    chk_body = chk_body.slice(valueRangeIndex + 1);
  }

  chk_body = chk_body.trim();

  if (chk_body[0] != '(' && chk_body[0] != '[') {
    return "[Error]:表达式" + chk_body + "非法";
  }
  if (chk_body[chk_body.length - 1] != ')' && chk_body[chk_body.length - 1] != ']') {
    return "[Error]:表达式" + chk_body + "非法";
  }

  var range = chk_body.slice(1, chk_body.length - 1).split(",").map(it => it.trim());

  if (chk_type == "enum") {
    return range.indexOf(value) >= 0;
  }


  if (chk_body[0] == '(' && range[0] <= value) {
    return false;
  }
  else if (chk_body[0] == "[" && range[0] < value) {
    return false;
  }
  else if (range.length > 1) {
    if (chk_body[chk_body.length - 1] == ")" && range[range.length - 1] >= value) {
      return false;
    }
    else if (chk_body[chk_body.length - 1] == "]" && range[range.length - 1] > value) {
      return false;
    }
  }

  return true;
}
jv.chk_types = {
  "float": function (chk_body, value, inputDom) {
    return (/^[+-]?[0-9]+.?[0-9]*$/).test(value);
  },
  "int": function (chk_body, value, inputDom) {
    return (/^[+-]?[0-9]+$/).test(value);
  },
  //表示字符串
  "": function (chk_body, value, dom) {
  }
}

//校验器
Object.defineProperty(HTMLElement.prototype, "chk", {
  //chk_show:如何显示的回调.
  value: function (chk_show) {
    var self = this;
    if (!chk_show) {
      console.log("需要参数 chk_show")
      return false;
    }
    // this.getElementsByClassName("chk-error").removeClass("chk-error")
    var list = Array.from(this.querySelectorAll("[chk]"));
    list = list.concat(Array.from(this.querySelectorAll("[data-chk]")))

    var ret = true;
    for (var item of list) {
      var inputDom = getInputDom(item);
      if (!inputDom) continue;

      inputDom.chk_dom = item;

      //取下一个非字符。 减号下划线除外
      var getNextNonCharIndex = function (exp) {
        var chk_type_index = Array.from(exp).findIndex(it => {
          var code = it.charCodeAt()
          if (code == 45 || code == 95) return true;
          if (code >= 65 && code <= 90) return false;
          if (code >= 97 && code <= 122) return false;
          return true;
        });

        if (chk_type_index < 0) {
          chk_type_index = exp.length;
        }
        return chk_type_index;
      }

      var ch = function (e) {
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
        }
        else {
          var chk_type_index = getNextNonCharIndex(chk)

          chk_type = chk.slice(0, chk_type_index);
          chk_body = chk.slice(chk_type_index);
        }

        var value = "";
        if (inputDom) {
          if (inputDom.tagName == "INPUT" || inputDom.tagName == "TEXTAREA") {
            value = inputDom.value;
          }
          else {
            value = inputDom.innerHTML;
          }
        }

        var chk_msg = "", chk_define_msg = "";
        if (chk_type != ":") {
          chk_define_msg = item.dataset.chkMsg || item.getAttribute("chk-msg") || "";
        }


        if (chk_type == ":") {
          chk_msg = eval("(value,dom) => {" + chk_body + "}").call(inputDom, value, inputDom)
        }
        else if (jv.chk_types[chk_type]) {
          var index = getNextNonCharIndex(chk_body)
          if (jv.chk_types[chk_type](chk_body.slice(0, index), value, inputDom, item) == false) {
            chk_msg = chk_define_msg || "不符合 " + chk_type + " 规范";
          }
          else {
            chk_body = chk_body.slice(index);
            if (chk_body) {
              // chk_body.split("&")
              chk_msg = jv.chk_range(chk_type, chk_body, value);

              if( chk_msg === true){
                chk_msg = "";
              }
              else if( chk_msg === false){
                chk_msg = chk_define_msg;
              }
            }
          }
        }
        else {
          //如果不是类型，则整体按正则算。
          chk_msg = (new RegExp(chk)).test(value) ? "" : chk_define_msg;
        }

        e.chk_msg = chk_msg;
        //即使没有消息,也要调用.使调用方隐藏提示.
        if (chk_show(chk_msg, inputDom, item) === false) {
          e.chk_return_value = false;
          return;
        }
      }

      inputDom.removeEventListener("blur", ch);
      inputDom.addEventListener("blur", ch);

      //Chrome
      if (document.createEvent) {
        //可以通过 ev 传值。
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent("blur", true, true);
        inputDom.dispatchEvent(ev);

        ret = !!ev.chk_msg && ret;
        if (ev.chk_return_value === false) {
          break;
        }
      }
      //IE
      else {
        var ev = document.createEventObject();
        inputDom.fireEvent("onblur", ev)

        ret = !!ev.chk_msg && ret;
        if (ev.chk_return_value === false) {
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

    return ret;
  }, enumerable: false
});

export default jv;
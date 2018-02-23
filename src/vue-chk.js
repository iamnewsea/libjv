import jv from "./vue-init"

// jv.chk_show = function (dom, msg) {
//   //dom.addClass("chk-error");
//   jv.error(msg);
// }

var getDomValue = function (dom) {
  if (dom.tagName == "INPUT") {
    return dom.value;
  }
  if (dom.tagName == "TEXTAREA") {
    return dom.value;
  }

  if( dom.childNodes.length == 0) return "";

  var domInput = dom.querySelector("input[type=hidden]")
  if (!domInput) {
    domInput = dom.querySelector("input");
  }
  if (!domInput) {
    domInput = dom.querySelector("textarea");
  }

  if( !domInput){
    return "";
  }

  return getDomValue(domInput);
}

var chk_length = function () {

}

jv.chk_types = {
  "int": function (chk_body, dom) {

  },
  "enum": function (chk_body, dom) {

  },
  ":": function (chk_body, dom) {
    chk_body = chk_body.trim();
    if (!chk_body) return;

    return eval("(value,dom) => {" + chk_body + "}").call(dom, getDomValue(dom), dom)
  },
  "": function (chk_body, dom) {

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

    var chk_msg;
    for (var item of list) {
      var chk = item.dataset.chk || item.getAttribute("chk") || "";
      chk = chk.trim();
      if (chk[0] == '*') {
        chk = chk.slice(1).trim();
      }
      if (!chk) continue;

      var chk_type_index = Array.from(chk).findIndex(it => {
        var code = it.charCodeAt()
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
      }
      else {
        chk_type = chk.slice(0, chk_type_index);
        chk_body = chk.slice(chk_type_index);
      }

      chk_msg = jv.chk_types[chk_type](chk_body, item, this);
      if (chk_msg) {
        if(chk_show(item, chk_msg) === false){
          break;
        }
      }
    }

    return !!chk_msg;
  }, enumerable: false
});

export default jv;
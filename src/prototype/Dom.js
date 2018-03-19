
if (!Node.prototype.addEventListener && Node.prototype.attachEvent) {
  //兼容性添加。
  Object.defineProperty(Node.prototype, "addEventListener", {
    value(event, fn) {
      return this.attachEvent("on" + event, fn);
    }, enumerable: false
  });

  Object.defineProperty(Node.prototype, "removeEventListener", {
    value(event, fn) {
      return this.detachEvent("on" + event, fn);
    }, enumerable: false
  });
}


//获取距离父dom的 x,y 距离.
Object.defineProperty(Node.prototype, "offset_pdom", {
  value(pdom) {
    if (this == pdom) return {x: 0, y: 0};

    var x = 0, y = 0;
    var ppdom = pdom.offsetParent;

    var getP = function (dom) {
      if (!dom) return;
      if (dom == pdom) {
        return true;
      }

      x += dom.offsetLeft;
      y += dom.offsetTop;

      if (dom == ppdom) {
        x -= pdom.offsetLeft;
        y -= pdom.offsetTop;

        return true;
      }

      return getP(dom.offsetParent);
    }

    if (getP(this)) {
      return {x: x, y: y};
    }
    return {};
  }
  , enumerable: false
});
//触发无素事件.value附加到event上.返回event
Object.defineProperty(Node.prototype, "trigger", {
  value(event, value) {
    if (Node.prototype.dispatchEvent) {
      var ev = document.createEvent("HTMLEvents");
      ev.initEvent(event, true, true);
      this.dispatchEvent(ev);
      return ev;
    }
    else {
      var ev = document.createEventObject();
      this.fireEvent("on" + event, ev)
      return ev;
    }
  }, enumerable: false
});



if (!Element.prototype.closest) {
  //兼容性添加。
  Object.defineProperty(Element.prototype, "closest", {
    value(selector) {
      var el = this;
      var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

      while (el) {
        if (matchesSelector.call(el, selector)) {
          break;
        }
        el = el.parentElement;
      }
      return el;
    }, enumerable: false
  });
}

//冒泡提示
Object.defineProperty(HTMLElement.prototype, "popTip", {
  value(msg) {
    var tip = Array.from(this.children).filter(it => {
      return it.className.split(" ").indexOf("chk-tip") >= 0;
    })[0];

    if (!tip) {
      tip = document.createElement("div")
      tip.classList.add("chk-tip")
      this.appendChild(tip);
    }
    tip.innerHTML = msg || "";

    if (msg) {
      this.classList.add("chk-tip-wrapper")
      tip.classList.remove("hide")
    }
    else {
      this.classList.remove("chk-tip-wrapper")
      tip.classList.add("hide")
    }

    return tip
  }, enumerable: false
});


document.cookieMap = (function () {
  // http://blog.csdn.net/lvjin110/article/details/37663067
  var language = navigator.language || navigator.browserLanguage;
  navigator.languageCode = "cn";

  if (language.indexOf("zh") < 0) {
    navigator.languageCode = "en";
  }

  var db = {};

  (document.cookie || "").split(";").forEach(it => {
    var sect = it.split("=");
    db[sect[0].trim()] = decodeURIComponent((sect[1] || "").trim());
  });

  return {
    get(key) {
      if (!key) return db;
      return db[key];
    }
    , set(key, value, cacheTime) {
      key = key.trim();
      value = encodeURIComponent(value.trim() || "");
      db[key] = value;

      var expires = "";
      if (cacheTime) {
        var exp = new Date();
        exp.setTime(exp.getTime() + cacheTime * 1000);
        expires = ";expires=" + exp.toGMTString()
      }
      document.cookie = key + "=" + value + ";path=/" + expires;
    }
    , remove(key) {
      this.set(key, "", -1);
    }
  };
})();

document.location.json = (function () {
  // http://blog.csdn.net/lvjin110/article/details/37663067

  let ret = {};
  location.search.slice(1).split("&").forEach(it => {
    var sects = it.split("=");
    ret[sects[0]] = sects[1];
  });
  return ret;
})();
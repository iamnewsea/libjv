(function () {
    //如果不是浏览器环境,则退出
    if (typeof(document) === "undefined") return;

    //避免多次执行
    if (location.json) return;

    document.cookieJson = (function () {
        // http://blog.csdn.net/lvjin110/article/details/37663067
        let language = navigator.language || navigator.browserLanguage;
        navigator.languageCode = "cn";

        if (language.indexOf("zh") < 0) {
            navigator.languageCode = "en";
        }

        let db = {};

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

    let query2Json = function (query) {
        let ret = {};
        query.split("&").forEach(function (it) {
            var sects = it.split("=");
            if (sects.length == 2) {
                ret[sects[0]] = decodeURIComponent(sects[1]);
            }
        });
        return ret;
    };

    location.json = function () {
        // http://blog.csdn.net/lvjin110/article/details/37663067

        return query2Json(location.search.slice(1));
    }();

    let loadHasjJson = function () {
        // http://blog.csdn.net/lvjin110/article/details/37663067

        let index = location.hash.indexOf("?");
        if (index < 0) return {};

        location.hashJson = query2Json(location.hash.slice(index + 1));
    };

    loadHasjJson();
    window.removeEventListener("hashchange", loadHasjJson);
    window.addEventListener("hashchange", loadHasjJson);

    //vue 使用了 pushState
    let pushState_ori = history.pushState
    history.pushState = function () {
        location.hashJson = {};
        let url = arguments[2];
        //找 #
        let index = url.indexOf("#");
        if (index < 0) {
            return pushState_ori.apply(null, arguments);

        }

        url = url.slice(index + 1);
        index = url.indexOf("?");
        if (index < 0) {
            return pushState_ori.apply(null, arguments);
        }

        location.hashJson = query2Json(url.slice(index + 1));
        return pushState_ori.apply(null, arguments);
    };

    location.json2href = function () {
        return location.protocol + "//" + location.host + location.pathname + "?" + Object.keys(location.json).map(it => it + "=" + encodeURIComponent(location.json[it])).join("&")
    };

//-----------------------------------------------------------------


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
                    el = el.parentNode;
                }
                return el;
            }, enumerable: false
        });
    }

    // //冒泡提示
    // Object.defineProperty(HTMLElement.prototype, "popTip", {
    //     value(msg) {
    //         var tip = Array.from(this.children).filter(it => {
    //             return it.className.split(" ").indexOf("chk-tip") >= 0;
    //         })[0];
    //
    //         if (!tip) {
    //             tip = document.createElement("div")
    //             tip.classList.add("chk-tip")
    //             this.appendChild(tip);
    //         }
    //         tip.innerHTML = msg || "";
    //
    //         if (msg) {
    //             this.classList.add("chk-tip-wrapper")
    //             tip.classList.remove("hide")
    //         }
    //         else {
    //             this.classList.remove("chk-tip-wrapper")
    //             tip.classList.add("hide")
    //         }
    //
    //         return tip
    //     }, enumerable: false
    // });

//在父项的索引
    Object.defineProperty(Element.prototype, "indexOfParent", {
        get() {
            var p = this.parentNode;
            if (!p) return -1;
            for (var i = 0, len = p.childNodes.length; i < len; i++) {
                var item = p.childNodes[i];
                if (item === this) {
                    return i;
                }
            }
            return -1;
        }, enumerable: false
    });

//targetElement.after(newElement) 返回newElement
    Object.defineProperty(Element.prototype, "after", {
        value(newElement) {
            var parent = this.parentNode;
            if (!parent) return;

            if (parent.lastChild == this) {
                parent.appendChild(newElement);
            }
            else {
                parent.insertBefore(newElement, this.nextSibling);
            }
        }, enumerable: false
    });
//只读化.
    Object.defineProperty(Element.prototype, "nonEdit", {
        value() {
            var tags = Array.from(this.querySelectorAll("input"));
            tags = tags.concat(Array.from(this.querySelectorAll("textarea")));

            for (var i = 0, len = tags.length; i < len; i++) {
                var item = tags[i], p = item.parentNode;
                var itemIndex = item.indexOfParent;
                var viewDom = document.createElement("span");
                item.getAttributeNames().forEach(it => {
                    viewDom.setAttribute(it, item.getAttribute(it));
                });
                for (var key in item.dataset) {
                    viewDom.dataset[key] = item.dataset[key];
                }

                viewDom.innerHTML = item.value;
                viewDom.classList.add("nonEdit");
                viewDom.classList.add("nonEdit_" + window.getComputedStyle(item).display)

                item.after(viewDom);
                item.style.display = "none";
            }

        }, enumerable: false
    });

})()
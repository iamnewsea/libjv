(function () {
    //如果不是浏览器环境,则退出
    if (typeof (document) === "undefined") return;

    //避免多次执行
    // if (location.json) return;

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

    location.query2Json = function (query) {
        query = query || location.search.slice(1);
        let ret = {};
        query.split("&").forEach(function (it) {
            var sects = it.split("=");
            if (sects.length == 2) {
                var key = sects[0];
                var value = decodeURIComponent(sects[1]);
                if (key in ret) {
                    var oriValue = ret[key];
                    if (oriValue.Type == "array") {
                        oriValue.push(value);
                    } else {
                        oriValue = [oriValue];
                        oriValue.push(value);
                    }
                    ret[key] = oriValue;
                } else {
                    ret[key] = value;
                }
            }
        });
        return ret;
    };


    //使用 json 替代 location.json
    location.json2search = function (json) {
        json = json || location.json;
        var ret = Object.keys(json).map(it => {
            var v = json[it];
            if (jv.IsNull(v)) {
                return "";
            }

            if (v.Type == "array") {
                return v.map(m => it + "=" + encodeURIComponent(m)).join("&")
            }

            return it + "=" + encodeURIComponent(v)
        }).join("&");

        if (ret) {
            return "?" + ret;
        }
        return ret;
    };

    location.getHost = function (url) {
        var r;
        if (url.startsWith("//")) {
            r = /^\/\/([^/\\]+)/i.exec(url)
        } else {
            r = /^http[s]*\:\/\/([^/\\]+)/i.exec(url)
        }

        if (r) {
            return r[1];
        }
        return "";
    };

    // location.json = function () {
    // 	// http://blog.csdn.net/lvjin110/article/details/37663067
    //
    // 	return query2Json(location.search.slice(1));
    // }();
    // http://blog.csdn.net/lvjin110/article/details/37663067

    let loadQueryJson = function () {
        location.json = location.query2Json(location.search.slice(1));
        var tail = location.search + location.hash;
        if (tail) {
            location.fullPath = location.href.slice(0, 0 - tail.length);
        } else {
            location.fullPath = location.href;
        }
    }

    let loadLocationHashJson = function () {
        let index = location.hash.indexOf("?");
        if (index < 0) {
            location.hashJson = {};
            return;
        }
        location.hashJson = location.query2Json(location.hash.slice(index + 1));
    };


    let loadAllJson = function () {
        loadQueryJson();
        loadLocationHashJson();

        if (location.changed) {
            location.changed();
        }
    };

    loadAllJson();


    window.removeEventListener("hashchange", loadLocationHashJson);
    window.addEventListener("hashchange", loadLocationHashJson);


    //vue 使用了 pushState
    let pushState_ori = history.pushState
    history.pushState = function () {
        loadAllJson();
        return pushState_ori.apply(null, arguments);
    };

    window.removeEventListener("popstate", loadAllJson);
    window.addEventListener("popstate", loadAllJson);


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
            } else {
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

    if (!Element.prototype.scrollBy) {
        //兼容性添加。
        Object.defineProperty(Element.prototype, "scrollBy", {
            value(offset_x, offset_y) {
                this.scrollLeft = this.scrollLeft + offset_x;
                this.scrollTop = this.scrollTop + offset_y;
                return;
            }, enumerable: false
        });
    }
    if (!Element.prototype.scrollTo) {
        //兼容性添加。
        Object.defineProperty(Element.prototype, "scrollTo", {
            value(x, y) {
                this.scrollLeft = x;
                this.scrollTop = y;
                return;
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
            } else {
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
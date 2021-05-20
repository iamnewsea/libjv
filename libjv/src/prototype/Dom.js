//-----------------------------------------------------------------
(function () {
    // Node环境需要
    if (typeof document === 'undefined') {
        return;
    }

    if (Location.prototype.json) {
        return;
    }

    if (!Node.prototype.addEventListener && Node.prototype.attachEvent) {
        //兼容性添加。
        Object.defineProperty(Node.prototype, "addEventListener", {
            value(event, fn) {
                return this.attachEvent("on" + event, fn);
            }, enumerable: false, configurable: true, writable: true
        });

        Object.defineProperty(Node.prototype, "removeEventListener", {
            value(event, fn) {
                return this.detachEvent("on" + event, fn);
            }, enumerable: false, configurable: true, writable: true
        });
    }

    Object.defineProperty(Node.prototype, "once", {
        value(event, callback) {
            return this.addEventListener(event, function fn(e) {
                e.currentTarget.removeEventListener(e.type, fn);
                return callback(e);
            }, false);
        }, enumerable: false, configurable: true, writable: true
    });

    document.cookieJson = (() => {
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
                value = value + "";
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


    // remove hash。
    Object.defineProperty(Location.prototype, "fullUrl", {
        get() {
            return location.href.slice(0, (0 - location.hash.length) || undefined);
        }, enumerable: false, configurable: true
    });

    Object.defineProperty(Location.prototype, "json", {
        get() {
            return jv.query2Json(location.search);
        }, enumerable: false, configurable: true
    });

    Object.defineProperty(Location.prototype, "hashJson", {
        get() {
            var hash = location.hash
            var hash_search_index = hash.indexOf("?");
            if (hash_search_index >= 0) {
                return jv.query2Json(hash.slice(hash_search_index));
            }
            return {};
        }, enumerable: false, configurable: true
    });


    //获取距离父dom的 x,y 距离.
    Object.defineProperty(Node.prototype, "offset_pdom", {
        value(pdom) {
            if (this == pdom) return {x: 0, y: 0};

            var x = 0, y = 0;
            var ppdom = pdom.offsetParent;

            var getP = (dom) => {
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
            };

            if (getP(this)) {
                return {x: x, y: y};
            }
            return {};
        }
        , enumerable: false, configurable: true, writable: true
    });


    /**
     * 触发元素事件.
     * event:
     * 1. 四个鼠标事件： "click", "dblclick", "mouseup", "mousedown"
     * 2. 自定义事件 jv.createEvent
     * 3. 系统事件 new MouseEvent("click", {view: window, bubbles: true, cancelable: true})
     */
    Object.defineProperty(Node.prototype, "trigger", {
        value(event) {
            if (["click", "dblclick", "mouseup", "mousedown"].includes(event)) {
                event = new MouseEvent(event, {view: window, bubbles: true, cancelable: true})
            }
            if (Node.prototype.dispatchEvent) {
                this.dispatchEvent(event);
                return event;
            } else {
                this.fireEvent("on" + event.type, event)
                return event;
            }
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * 获取从根元素到该元素的所有路径
     */
    Object.defineProperty(Element.prototype, "wbs", {
        value() {
            var p = this.parentElement;
            if (p) {
                return [...p.wbs(), this];
            }
            return [this];
        }, enumerable: false, configurable: true, writable: true
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
            }, enumerable: false, configurable: true, writable: true
        });
    }

    if (!Element.prototype.scrollBy) {
        //兼容性添加。
        Object.defineProperty(Element.prototype, "scrollBy", {
            value(offset_x, offset_y) {
                this.scrollLeft = this.scrollLeft + offset_x;
                this.scrollTop = this.scrollTop + offset_y;
                return;
            }, enumerable: false, configurable: true, writable: true
        });
    }
    if (!Element.prototype.scrollTo) {
        //兼容性添加。
        Object.defineProperty(Element.prototype, "scrollTo", {
            value(x, y) {
                this.scrollLeft = x;
                this.scrollTop = y;
                return;
            }, enumerable: false, configurable: true, writable: true
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
        }, enumerable: false, configurable: true
    });

// targetElement.after(newElement) 返回newElement
    Object.defineProperty(Element.prototype, "after", {
        value(newElement) {
            var parent = this.parentNode;
            if (!parent) return;

            if (parent.lastChild == this) {
                parent.appendChild(newElement);
            } else {
                parent.insertBefore(newElement, this.nextSibling);
            }
        }, enumerable: false, configurable: true, writable: true
    });

    /**
     * 克隆Dom
     */
    Object.defineProperty(Element.prototype, "cloneDom", {
        value(tagName, callback) {
            if (!tagName) {
                tagName = this.tagName;
            }

            var item = this, p = item.parentNode;

            var viewDom = document.createElement(tagName);
            item.getAttributeNames().forEach(it => {
                viewDom.setAttribute(it, item.getAttribute(it));
            });
            for (var key in item.dataset) {
                viewDom.dataset[key] = item.dataset[key];
            }

            viewDom.innerHTML = item.value;

            if (callback) {
                callback(viewDom);
            }

            return viewDom;
        }, enumerable: false, configurable: true, writable: true
    });


    //重写Storage方法，添加 namespace。
    var ori_storage_getItem = Storage.prototype.getItem,
        ori_storage_setItem = Storage.prototype.setItem,
        ori_storage_removeItem = Storage.prototype.removeItem,
        ori_storage_key = Storage.prototype.key;

    Storage.prototype.getNsKey = function (key) {
        if (!this.namespace) return key;
        if (key.startsWith(this.namespace + ":")) return key;
        return this.namespace + ":" + key;
    }

    Storage.prototype.getItem = function (key) {
        return ori_storage_getItem.call(this, this.getNsKey(key));
    }
    Storage.prototype.setItem = function (key, value) {
        return ori_storage_setItem.call(this, this.getNsKey(key), value);
    }

    Storage.prototype.removeItem = function (key) {
        return ori_storage_removeItem.call(this, this.getNsKey(key));
    }

    Storage.prototype.key = function (index) {
        var key = ori_storage_key.call(this, index);
        if (this.namespace && key.startsWith(this.namespace + ":")) {
            return key.slice(this.namespace.length + 1);
        }
        return key;
    }

    Storage.prototype.keys = function () {
        var ret = Object.keys(this);
        if (this.namespace) {
            var len = this.namespace.length;
            ret = ret.filter(it => it.startsWith(this.namespace + ":")).map(it => it.slice(len + 1));
        }
        return ret;
    }

    Object.defineProperty(Storage.prototype, "getJson", {
        value(key) {
            //去除 _{名称}_ 前后下划线的部分。
            var url = jv.getUrlWithout_(key);
            var value = this.getItem(url);
            if (!value) return null;
            return JSON.parse(value);
        }, enumerable: false, configurable: true, writable: true
    })

    Object.defineProperty(Storage.prototype, "setJson", {
        value(key, json) {
            var url = jv.getUrlWithout_(key);

            if (jv.isNull(json)) {
                return this.removeItem(url);
            }
            this.setItem(url, JSON.stringify(json))
        }, enumerable: false, configurable: true, writable: true
    })

    /*在原来Json基础上修改Json*/
    Object.defineProperty(Storage.prototype, "patchJson", {
        value(key, json) {
            if (jv.isNull(json)) {
                return;
            }
            var url = jv.getUrlWithout_(key);

            var value2 = Object.assign({}, this.getJson(url), json)
            this.setItem(url, JSON.stringify(value2));
        }, enumerable: false, configurable: true, writable: true
    })

    //只读化.
    Object.defineProperty(Element.prototype, "nonEdit", {
        value() {
            var tags = Array.from(this.querySelectorAll("input"));
            tags = tags.concat(Array.from(this.querySelectorAll("textarea")));

            for (var i = 0, len = tags.length; i < len; i++) {
                var item = tags[i];

                var viewDom = item.cloneDom("span");
                viewDom.classList.add("nonEdit");
                viewDom.classList.add("nonEdit_" + window.getComputedStyle(item).display)

                item.after(viewDom);
                item.style.display = "none";
            }

            Array.from(this.querySelectorAll("button")).forEach(it => {
                it.classList.add("nonEdit");
            })

        }, enumerable: false, configurable: true, writable: true
    });

})();

//-----------------------------------------------------------------
(function () {
    // Node环境需要
    if (typeof document === 'undefined' ) {
        return;
    }
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
})();

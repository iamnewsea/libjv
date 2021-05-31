import jv from "./file-upload"

/**
 *
 * @param eventName
 * @param evDetail 必须是 {detail: 数据 }
 * @returns {CustomEvent<any>}
 */
jv.createEvent = (eventName, evDetail) => {
    if (jv.inBrowser) {
        var chkEvent;
        if (document.createEvent) {
            chkEvent = document.createEvent("CustomEvent");
            chkEvent.initCustomEvent(eventName, true, true, evDetail);
        } else {
            chkEvent = new CustomEvent(eventName, evDetail);
        }
        return chkEvent;
    }
};


/**
 * meta标签
 * @param where
 * @param attrs
 */
jv.meta = (where, attrs) => {
    if (!attrs || !where) return;
    var metas = Array.from(document.head.children).filter(it => it.tagName == "META");
    Object.keys(where).forEach(key => {
        metas = metas.filter(it => it[key] == where[key]);
    });

    var meta = metas[0];
    if (!meta) {
        meta = document.createElement("META");
        Object.keys(where).forEach(key => {
            meta.setAttribute(key, where[key]);
        });
        document.head.appendChild(meta);
    }

    Object.keys(attrs).forEach(key => {
        meta.setAttribute(key, attrs[key]);
    });
};


/**
 * 窗口变化事件回调，延时 150ms 触发一次,
 * 应该放到 App.vue created 方法中执行。保证在DOMContentLoadedgk事件后。
 */
jv.resize = (callback, time) => {
    if (!callback) return;

    var timerId = 0;
    time = time || 150;

    var recalc = () => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(callback, time);
    };

    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(resizeEvt, recalc, false);
    callback();
    return recalc;
};


jv.initDomResize = function (element) {
    var bind_resize = function (e) {
        e.target.frameElement.observer.forEach(function (it) {
            it(e);
        })
    };

    var observerDom = Array.from(element.children).last(it => it.observer);
    if (observerDom) {
        //判断是否有事件
        observerDom.contentWindow.removeEventListener('resize', bind_resize);
        observerDom.contentWindow.addEventListener('resize', bind_resize);
        return observerDom;
    }
    const maxLeft = 3.35544e+07,
        maxTop = 3.35544e+07;


    observerDom = document.createElement('iframe');
    observerDom.observer = [];
    observerDom.style.cssText = `position:absolute;width:100%;height:100%;left:${-maxLeft}px;top:${-maxTop}px;overflow:hidden`;
    element.appendChild(observerDom);
    observerDom.contentWindow.removeEventListener('resize', bind_resize);
    observerDom.contentWindow.addEventListener('resize', bind_resize);

    return observerDom;
}
//
jv.domResize = function (element, callback) {
    /**
     * 监听dom元素尺寸是否发生了变化
     * @param {HTMLElement} element
     * @param {function} callback
     */

    var observerDom = jv.initDomResize(element);

    if (!observerDom.observer.includes(callback)) {
        observerDom.observer.push(callback);
    }
}

jv.removeDomResizes = function (element) {
    var dom = jv.initDomResize(element);
    dom.parentElement.removeChild(dom);
}


jv.getOrPutDiv = (divId, attributes, styles) => {
    var ret = document.getElementById(divId);
    if (ret) return ret;
    ret = document.createElement("div")
    ret.id = divId;
    if (attributes) {
        Object.keys(attributes).forEach(key => {
            ret.setAttribute(key, attributes[key]);
        })
    }
    if (styles) {
        Object.keys(styles).forEach(key => {
            ret.style[key] = styles[key]
        })
    }
    document.body.appendChild(ret)
    return ret;
}


//通过 iframe 打开
jv.downloadFile = url => {
    if (!url) return;
    if (!url.includes("?")) {
        url += "?"
    }
    var json = jv.query2Json(url);
    if (!("_" in json)) {
        json["_"] = jv.random()
    }

    if (!("iniframe" in json)) {
        json["iniframe"] = "true";
    }
    url = jv.param(json, true);
    console.log("jv.downloadFile:" + url);
    var div = jv.getOrPutDiv("download_div", {}, {display: "none"})
    div.innerHTML = "";
    div.innerHTML = "<iframe src=\"" + url + "\" />";
}

//通过 a 打开。
jv.open = (url, target) => {
    if (!url) {
        return;
    }
    var link = jv.getOrPutDiv("open_a", {}, {display: "none"})
    if (target) {
        link.setAttribute("target", target);
    }
    link.setAttribute("href", url);
    link.trigger(new MouseEvent("click", {view: window, bubbles: true, cancelable: true}));
}


/**
 * 从 container 向下，遍历 $children，根据 $el == dom 查找 dom所属的 vnode
 * @param container
 * @param dom
 */
jv.findVNode = (container, dom) => {
    if (container.$el === dom) {
        return container;
    }
    var ret;
    for (var item of container.$children) {
        ret = jv.findVNode(item, dom);
        if (ret) {
            return ret;
        }
    }
};


/**
 * 添加外部的 script 标签
 */
jv.addScriptFile = (fileName, attributes, content) => {
    if (!fileName && !content) return Promise.reject();

    if (fileName) {
        var id = jv.getIdFromUrl(fileName);
        var script = document.getElementById(id);
        if (script) {
            return Promise.resolve();
        }
    }

    attributes = attributes || {};
    if (!attributes.type) {
        attributes.type = "text/javascript";
    }
    attributes.id = id;

    var self = this;
    return new Promise((r, e) => {
        script = document.createElement("script");

        if (fileName) {
            script.onload = script.onreadystatechange = function () {
                if (!this.readyState     //这是FF的判断语句，因为ff下没有readyState这人值，IE的readyState肯定有值
                    || this.readyState == 'loaded' || this.readyState == 'complete'   // 这是IE的判断语句
                ) {
                    r.call(self, fileName, attributes);
                }
            };
        }

        Object.keys(attributes).forEach(it => {
            script.setAttribute(it, attributes[it]);
        });

        if (fileName) {
            script.src = fileName;
        }
        if (content) {
            script.text = content;
        }
        document.head.appendChild(script);

        if (!fileName) {
            r.call(self, fileName, attributes);
        }
    });
};

/**
 * 添加 link css的文件引用。
 */
jv.addLinkCssFile = (fileName, attributes) => {
    if (!fileName) return;

    var id = jv.getIdFromUrl(fileName);

    var link = document.getElementById(id);
    if (link) {
        return;
    }

    link = document.createElement("link");

    attributes = attributes || {};

    if (!attributes.type) {
        attributes.type = "text/css";
    }
    if (!attributes.rel) {
        attributes.rel = "stylesheet";
    }
    attributes.id = id;

    Object.keys(attributes).forEach(it => {
        link.setAttribute(it, attributes[it]);
    });

    link.href = fileName;
    document.head.appendChild(link);
};

//添加 style 标签
jv.addStyleDom = (id, cssContent, attributes) => {
    if (!cssContent) return;


    var style = id && document.getElementById(id);
    if (!style) {
        style = document.createElement("style");
        document.head.appendChild(style);
    }
    attributes = attributes || {};

    if (!attributes.type) {
        attributes.type = "text/css";
    }

    if (id) {
        attributes.id = id;
    }

    Object.keys(attributes).forEach(it => {
        style.setAttribute(it, attributes[it]);
    });

    if (style.styleSheet) {
        style.styleSheet.cssText = cssContent;
    } else {
        style.innerHTML = cssContent;
    }
};


export default jv;
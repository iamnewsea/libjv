import jv from "./libjv"

(function () {
    if (typeof (HTMLElement) === "undefined") return;


    //vue 验证在 sect 组件中处理 msg
    jv.chk_msg_vue_tag = "sect";
    //初始化chk时，对 .kv 添加 must 样式。
    jv.chk_must_dom_class = "kv";
    //html 验证在 .sect 元素中处理 msg
    jv.chk_msg_html_class = "sect";


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


        if (chk_body[0] == '(' && value <= range[0]) {
            return false;
        } else if (chk_body[0] == "[" && value < range[0]) {
            return false;
        } else if (range.length > 1) {
            var lastSign = chk_body[chk_body.length - 1], lastValue = range[1];
            if (lastSign == ")" && value >= lastValue) {
                return false;
            } else if (lastSign == "]" && value > lastValue) {
                return false;
            }
        }

        return true;
    };

    jv.chk_types = {
        "float": function (value, chk_body) {
            return (/^[+-]?[0-9]+.?[0-9]*$/).test(value);
        },
        "int": function (value, chk_body) {
            return (/^[+-]?[0-9]+$/).test(value);
        },
        "date": function (value, chk_body) {
            return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1])$/).test(value);
        },
        "date-time": function (value, chk_body) {
            return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1]) ([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/).test(value);
        },
        "time": function (value, chk_body) {
            return (/^([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/).test(value);
        },
        "email": function (value, chk_body) {
            return (/^([\w-])+@([\w-])+(\.[\w-]{1,})$/).test(value);
        },
        //名称
        "name": function (value, chk_body) {
            return (/^[\w\d]+$/).test(value);
        },
        //*号必填
        "*": function (value, chk_body) {
            if (value === 0) return true;
            if (value === false) return true;
            return jv.hasValue(value);
        },
        //文本类型，返回 true,可空.
        "": function () {
            return true;
        }
    };


    //取下一个非字符。 减号下划线除外
    var getNextNonCharIndex = function (exp) {
        var chk_type_index = Array.from(exp).findIndex(it => {
            return !isValidateChar(it.charCodeAt())
        });

        if (chk_type_index < 0) {
            chk_type_index = exp.length;
        }
        return chk_type_index;
    };

    var isValidateChar = function (code) {
        if (code == 45 || code == 95) return true;
        if (code >= 65 && code <= 90) return true;
        if (code >= 97 && code <= 122) return true;
        if (code >= 48 && code <= 57) return true;

        return false;
    };

//-------------------------------------------------------------------------------------
    //找到后，就不再查找子元素了。
    var getAllVuesChkDom = function (vueDom) {
        var ret = [];
        if (!vueDom) return ret;
        if (vueDom.$attrs && vueDom.$attrs.chk) {
            ret.push(vueDom);
            return ret;
        }

        if (!vueDom.$children) return ret;
        vueDom.$children.forEach(v => {
            ret.pushAll(getAllVuesChkDom(v));
        });
        return ret;
    };

    var convertValue = function (value) {
        var v = value;
        if (jv.isNull(v)) {
            v = "";
        }
        // if (v.Type == "date") {
        //     v = v.toDateString();
        // } else {
        //     v = v.toString();
        // }
        return v;
    };
    //查找dom下第一个绑定 v-model 的值.返回 { vnode : v-model 对象, value : v-model 的值, data }
    var getVueData = function (component) {
        var vnode = component.$vnode, vdata = vnode.data, ret = {}, data = vnode.context._data;
        if (vdata && vdata.model && vdata.model.expression) {
            if ("value" in vdata.model) {
                return {value: convertValue(vdata.model.value), data: data};
            }

            //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
            var ret = jv.evalExpression(data, vdata.model.expression);
            if (jv.evalExpressionError) {
                return {};
            }
            return {value: convertValue(ret), data: data};
        }

        return {};
    };


    // vueModel = { vnode , value }
    jv.chk_vue_item = function (chk_dom, chk, chk_msg) {
        var attr = chk_dom.$attrs || {};

        chk = chk || attr.chk || "";
        chk = chk.trim();
        if (!chk) return true;

        var {value, data} = getVueData(chk_dom);
        if (!data) {
            throw new Error("找不到vue数据!")
        }

        var chk_result = Object.assign(
            {msg: attr.chkmsg || chk_msg},
            jv.chk_core(chk, value, data));


        var chkEvent = jv.createEvent("chked", {
            msg: !chk_result.result && (chk_result.msg || chk_dom.$attrs.placeholder || chk_result.detail) || "",
            target: chk_dom.$el
        });

        chk_dom.$emit(chkEvent.type, chkEvent);
        // chk_dom.$el.trigger(chkEvent);

        var up_finded = false;
        //优先使用指定的 tag 显示消息，如果没指定tag,则用 html 的 class 元素显示消息。
        if (jv.chk_msg_vue_tag) {
            var sect = chk_dom.$Closest(jv.chk_msg_vue_tag);
            if (sect) {
                up_finded = true;
                chked_dom_msg(sect.$el, chkEvent);
                sect.$emit(chkEvent.type, chkEvent);
            }
        }

        if (!up_finded && jv.chk_msg_html_class) {
            var sect = chk_dom.$el.closest("." + jv.chk_msg_html_class);
            if (!sect) {
                var div = document.createElement("div")
                div.classList.add(jv.chk_msg_html_class)
                chk_dom.$el.parentElement.appendChild(div);
                div.appendChild(chk_dom.$el)

                sect = chk_dom.$el.closest("." + jv.chk_msg_html_class);
            }

            if (sect) {
                chked_dom_msg(sect, chkEvent);
                sect.trigger(chkEvent);
            }
        }

        if (chk_result.result) {
            chk_dom.$el.classList.remove("chk-error");
            return true;
        }

        chk_dom.$el.classList.add("chk-error");
        return false;
    }

    /**
     * 向上查找Vue Dom
     * @param html_dom
     */
    var getParentVueDom = function (html_dom) {
        if (!html_dom) {
            return null;
        }
        if (html_dom.__vue__) {
            return html_dom;
        }
        return getParentVueDom(html_dom.parentElement);
    };

    var getHtmlData = function (html_dom) {
        var pDom = getParentVueDom(html_dom);
        var data = {};
        if (pDom) {
            data = pDom.$vnode.context._data;
        }
        return {value: convertValue(html_dom.value), data: data};
    };

    /**
     * 单个 html 元素进行 chk，需要在 $vnode 元素下。
     * @param chk_dom
     * @param chk
     * @param chk_msg
     * @returns {boolean}
     */
    jv.chk_html_item = function (chk_dom, chk, chk_msg) {

        chk = chk || chk_dom.getAttribute("chk") || "";
        chk = chk.trim();
        if (!chk) return true;


        var {value, data} = getHtmlData(chk_dom);
        // if (!data) {
        //     throw new Error("找不到vue数据!")
        // }

        var chk_result = Object.assign(
            {msg: chk_msg || chk_dom.getAttribute("chkmsg")},
            jv.chk_core(chk, value, data));


        var chkEvent = jv.createEvent("chked", {
            msg: !chk_result.result && (chk_result.msg ||
                chk_dom.placeholder ||
                chk_result.detail) || "", target: chk_dom
        });

        //想要触发元素上的 chked 事件，必须用 addEventListener 绑定事件
        chk_dom.trigger(chkEvent);

        //用 html 的 class 元素显示消息。
        if (jv.chk_msg_html_class) {
            var sect = chk_dom.closest("." + jv.chk_msg_html_class);
            if (sect) {
                chked_dom_msg(sect, chkEvent);
                sect.trigger(chkEvent);
            }
        }


        if (chk_result.result) {
            chk_dom.classList.remove("chk-error");
            return true;
        }

        chk_dom.classList.add("chk-error");
        return false;
    }

    /**
     * 核心校验函数，可以从脚本中递归执行。如：
     * <input chk=": var r = jv.chk_core(int); if( r.result == false) return r.msg; "
     * @param chk
     * @param value
     * @param data
     * @returns {*|boolean}
     */
    jv.chk_core = function (chk, value, data) {
        var ret = {result: true};

        var chk_type_index = getNextNonCharIndex(chk),
            chk_type = chk.slice(0, chk_type_index),
            chk_body;

        if (chk[0] == ':') {
            chk_type = ":";
            chk_body = chk.slice(1);
        } else if (chk_type == "reg") {
            if (chk[chk_type_index] != ':') {
                ret.result = false;
                ret.detail = "[Error]正则表达式缺少冒号";
                return ret;
            }
            chk_body = chk.slice(chk_type_index + 1);
        } else {
            chk_body = chk.slice(chk_type_index);
        }


        //如果是类型带着?表示可空.
        if (chk_body[0] == '?') {
            chk_body = chk_body.slice(1);
            if (!value) {
                chk = "";
                chk_type = "";
                chk_body = "";
            }
        }

        if (chk_type == ":") {
            //函数内部也可以调用 jv.chk_core("enum('a','b','c')",value,data);
            var r = eval("(value,data) => {" + chk_body + "}")(value, data);
            ret.result = !r;
            ret.msg = r;
            return ret;
        } else if (chk_type == "reg") {
            //如果不是类型，则整体按正则算。
            var reg;
            ret.detail = "校验正则表达式不通过";
            try {
                reg = eval(chk_body);
                ret.result = reg.test(value);
                return ret;
            } catch (e) {
                ret.result = false;
                ret.detail = "正则表达式非法";
                return ret;
            }
        } else if (chk) {
            //如果定义了 * 号,表示必填.
            var chk_type2 = Object.keys(jv.chk_types).find(it => chk.startsWith(it)) || "";
            if (chk_type2) {
                chk_type = chk_type2;
                chk_body = chk.slice(chk_type.length).trim();
            }

            if (!(chk_type in jv.chk_types)) {
                ret.result = false;
                ret.detail = "[Error]不识别的类型" + chk_type;
                return ret;
            }

            var r2 = jv.chk_types[chk_type](value, chk_body);

            if (!r2) {
                ret.result = false;
                if (chk_type == "*") {
                    ret.detail = "必填项!";
                } else {
                    ret.detail = "需要 " + chk_type + " 类型";
                }
                return ret;
            }

            if (chk_body) {
                // chk_body.split("&")
                var r = jv.chk_range(chk_type, chk_body, value);
                if (r === false) {
                    ret.result = r;
                    ret.detail = "范围不正确";
                    return ret;
                }
                if (r && (r.Type == "string")) {
                    ret.result = false;
                    ret.detail = r;
                    return r;
                }
            }
        }

        return ret;
    };

    var chked_dom_msg = (htmlDom, chkEvent) => {
        var tooltip = chkEvent.detail.msg;

        var msg_dom;
        for (var it of htmlDom.children) {
            if (it.classList.contains("chk-msg")) {
                msg_dom = it;
                break;
            }
        }

        if (!tooltip) {
            if (msg_dom) {
                htmlDom.removeChild(msg_dom);
            }

            return;
        }

        if (!msg_dom) {
            msg_dom = document.createElement("div");
            msg_dom.classList.add("chk-msg");
            htmlDom.append(msg_dom)
        }

        msg_dom.innerHTML = tooltip;
    };

    /**
     * 从 html 角度遍历进行 chk,还是 vue 优先，遇到vue就调用vue了。
     * @param container
     * @param setting
     * @returns {boolean}
     */
    jv.chk = jv.chk_html = function (container, setting) {
        setting = setting || {};
        var singleShow = setting.singleShow;
        var recusion_vue_dom = (dom, setting) => {
            if (dom.__vue__) {
                return dom.__vue__.chk(setting);
            }
            if (dom.$vnode) {
                return dom.chk(setting);
            }

            var ret = true;

            for (var i = 0, children = dom.children, len = children.length; i < len; i++) {
                var item = children[i];
                if (item.getAttribute("chk")) {
                    ret &= jv.chk_html_after_vue(item, setting);
                    if ((ret === false) && singleShow) {
                        return ret;
                    }
                }

                ret &= recusion_vue_dom(item, setting);
                if ((ret === false) && singleShow) {
                    return ret;
                }
            }

            return ret;
        };

        //可以是 id 选择器 和 vue v-model 表达式
        // if (filter.Type == "string") {
        //     var con = container
        //     if (con.$vnode) {
        //         con = con.$el
        //     }
        //     if (filter[0] == "#") {
        //         container = con.getElementById(filter.slice(1))
        //     } else {
        //         container = jv.getVDomFromExpression(con, filter)
        //     }
        // }

        return recusion_vue_dom(container, setting)
    }

    /**
     * 通过表过式，查询VDom,性能差
     * @param findExp
     */
    jv.getVDomFromExpression = function (container, findExp) {
        if (!container) return null;

        var recusion_html = function (container, findExp) {
            var container_vue = container.__vue__;
            if (container_vue) {
                return recusion_vue(container_vue, findExp)
            }
            if (container.$vnode) {
                return recusion_vue(container, findExp)
            }


            for (var i = 0, children = container.children, len = (children && children.length || 0); i < len; i++) {
                var item = children[i];
                var ret = recusion_html(item, findExp)
                if (ret) {
                    return ret;
                }
            }
            return null;
        }

        var recusion_vue = function (container, findExp) {
            if (!container) return null;
            var exp = jv.getVueExpression(container);
            if (exp == findExp) {
                return container;
            }
            for (var i = 0, children = container.$children, len = children.length; i < len; i++) {
                var item = children[i];
                var ret = recusion_vue(item, findExp);
                if (ret) {
                    return ret;
                }
            }
            return null;
        }

        if (container.$vnode) {
            return recusion_vue(container, findExp);
        } else if (container.__vue__) {
            return recusion_vue(container.__vue__, findExp);
        }
        return recusion_html(container, findExp)
    }

    /**
     * 遍历html,但依然可以处理 vue chk
     * @param container
     * @param setting
     * @returns {boolean}
     */
    jv.chk_html_after_vue = function (container, setting) {
        setting = setting || {}
        //原生Dom检测，原生Dom需要使用 @chked 定义事件。
        var ret = true, singleShow = setting.singleShow,
            excludes = setting.excludes || [],
            excludes_exp = excludes.filter(it => it.Type == "string"),
            list = Array.from(container.querySelectorAll("[chk]"));

        for (var chk_dom of list) {
            //如果该组件是 vue 组件，并且已处理过，就不用再处理了。
            if (chk_dom.chk_vue_proced) {
                continue;
            } else if (chk_dom.__vue__) {
                ret &= jv.chk_vue(container, setting);
                if (singleShow) {
                    return ret;
                }
                continue;
            }


            if (excludes && (excludes.includes(chk_dom) ||
                (chk_dom.id && excludes_exp.includes("#" + chk_dom.id)))) {
                continue
            }

            ret &= jv.chk_html_item(chk_dom);


            if (!ret && singleShow) {
                return ret;
            }
        }
        return ret;
    }

    /**
     *
     * @param vdom ,  htmlDom.__vue__ 是也
     * @returns {string|*}
     */
    jv.getVueExpression = function (vdom) {
        var model = vdom && vdom.$vnode.data.model;
        return model && model.expression || "";
    }

    //校验器
    /**
     * chk="reg:/^[+-]?[0-9]+$/"
     * chk="int"
     * chk="int{value.length}(3,4]"
     * chk="{value}[10,99]"
     * chk=": if( value.length < 3) return '长度必须大于3'"
     *
     * chk格式：
     * :回调
     * reg:表达式
     * chk_type{value表达式}(开始值，结束值)
     *
     *
     * 判断方法：按非字符,拆分出： chk_type
     * 1. 冒号开头
     * 2. chk_type == "reg"
     * 3. chk_type 有对应。
     * 特殊的chk_type: reg , function
     */
    // Object.defineProperty(jv.Vue.prototype, "chk", {
    //     chk_show:如何显示的回调.
    //     value: function (singleShow) {
    jv.chk_vue = function (container, setting) {
        setting = setting || {};
        var ret = true,
            excludes = setting.excludes || [],
            excludes_exps = excludes.filter(it => it.Type == "string"),
            singleShow = setting.singleShow,
            list = getAllVuesChkDom(container);

        for (var chk_dom of list) {
            chk_dom.$el.chk_vue_proced = true;
            Array.from(chk_dom.$el.querySelectorAll("[chk]")).forEach(it => {
                it.chk_vue_proced = true;
            });

            if (excludes && (excludes.includes(chk_dom) ||
                excludes_exps.includes(jv.getVueExpression(chk_dom)) ||
                (chk_dom.id && excludes_exp.includes("#" + chk_dom.id)))) {
                continue
            }

            ret &= jv.chk_vue_item(chk_dom);

            if (!ret && singleShow) {
                return ret;
            }
        }

        ret &= jv.chk_html_after_vue(container.$el, setting)

        return ret;
    }


//注册样式. 把 chk有值,且里面没有问号的元素,添加属性 chk-require ,供样式表显示必填样式.
// jv.Vue.mixin({
//   created(){
//
//   }
// })
})();
export default jv;

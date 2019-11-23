import jv from "./vue-init"

(function () {
    if (typeof (HTMLElement) === "undefined") return;


// jv.chk_show = function (dom, msg) {
//   //dom.addClass("chk-error");
//   jv.error(msg);
// }

    // jv.chk_show = function (chk_msg, inputDom, dom) {
    //     var tip = dom.popTip(chk_msg);
    //     if (chk_msg) {
    //         var chkMsgOffset = dom.dataset.chkMsgOffset || dom.getAttribute("chk-msg-offset");
    //         if (chkMsgOffset) {
    //             chkMsgOffset = inputDom.closest(chkMsgOffset)
    //
    //             if (!chkMsgOffset) {
    //                 chkMsgOffset = inputDom;
    //             }
    //         } else {
    //             chkMsgOffset = inputDom;
    //         }
    //         tip.style.marginLeft = (chkMsgOffset.offset_pdom(dom).x || 0) + "px";
    //     }
    // };

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
        "float": function (chk_body, value) {
            return (/^[+-]?[0-9]+.?[0-9]*$/).test(value);
        },
        "int": function (chk_body, value) {
            return (/^[+-]?[0-9]+$/).test(value);
        },
        "date": function (chk_body, value) {
            return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1])$/).test(value);
        },
        "date-time": function (chk_body, value) {
            return (/^\d{4}[-/]([01]?\d|2[0-4])[-/]([0-2]?\d|3[0-1]) ([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/).test(value);
        },
        "time": function (chk_body, value) {
            return (/^([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/).test(value);
        },
        "email": function (chk_body, value) {
            return (/^([\w-])+@([\w-])+(\.[\w-]{1,})$/).test(value);
        },
        //名称
        "name": function (chk_body, value) {
            return (/^[\w\d]+$/).test(value);
        },
        //*号必填
        "*": function (chk_body, value) {
            if (!value.length) {
                return false;
            }
            return true;
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

    // var getInputDom = function (dom) {
    //     if (dom.tagName == "INPUT") {
    //         return dom;
    //     }
    //     if (dom.tagName == "TEXTAREA") {
    //         return dom;
    //     }
    //
    //     if (!dom.childNodes.length) return null;
    //
    //     var domInput = dom.querySelector("input[type=hidden]")
    //     if (!domInput) {
    //         domInput = dom.querySelector("input");
    //     }
    //     if (!domInput) {
    //         domInput = dom.querySelector("textarea");
    //     }
    //     return domInput;
    // };
    //
    // var getVueFromUp =function(dom,deep){
    //     if(!dom) return ;
    //     deep = deep || 0;
    //
    //     if( deep > 9) return ;
    //
    //     var vueDom = dom.__vue__;
    //     if( vueDom){
    //         return vueDom;
    //     }
    //     return getVueFromUp(dom.parentElement);
    // };
    //
    var getVueTooltipFromUp = function (vueDom, deep) {
        if (!vueDom) return;
        deep = deep || 0;

        if (deep > 9) return;

        if (vueDom.$options._componentTag == "el-tooltip") {
            return vueDom;
        }
        return getVueTooltipFromUp(vueDom.$options.parent);
    };

    // var getInputValue = function (dom) {
    //     if (!dom.tagName) {
    //         return null;
    //     }
    //
    //     if (dom.tagName == "INPUT" || dom.tagName == "TEXTAREA") {
    //         return dom.value;
    //     }
    //
    //     var ret;
    //     for (var item of dom.children) {
    //         ret = getInputValue(item);
    //         if (ret) {
    //             return ret;
    //         }
    //     }
    //     return null;
    // }


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

    //查找dom下第一个绑定 v-model 的值.返回 { vnode : v-model 对象, value : v-model 的值, data }
    var getVueData = function (component) {
        var vnode = component.$vnode, vdata = vnode.data, ret = {}, data = vnode.context._data;
        if (vdata && vdata.model && vdata.model.expression) {
            if ("value" in vdata.model) {
                return {value: vdata.model.value || "", data: data};
            }

            //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
            var ret = jv.evalExpression(data, vdata.model.expression);
            if (ret.ok) {
                return {value: ret.value || "", data: data};
            } else return {};
        }

        return {};
    };

    //vueModel = { vnode , value }
    var chk_item = function (chk_dom) {

        var ret = {result: true};
        if (!chk_dom.$attrs) return ret;

        var chk = chk_dom.$attrs.chk || "";
        chk = chk.trim();
        if (!chk) return ret;

        ret.msg = chk_dom.$attrs.chkMsg;

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

        var {value, data} = getVueData(chk_dom);
        if (!data) {
            ret.result = false;
            ret.detail = "找不到vue数据!";
            return ret;
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

            var r2 = jv.chk_types[chk_type](chk_body, value);

            if (r2 === false) {
                ret.result = false;
                if (chk_type == "*") {
                    ret.detail = "必填项不能为空";
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
    //     //chk_show:如何显示的回调.
    //     value: function (singleShow) {
        jv.chk_vue_dom = function(container,singleShow){
            var index = 0, ret = true, list = getAllVuesChkDom(container);

            for (var chk_dom of list) {
                var chk_result = chk_item(chk_dom);

                var chkEvent = new CustomEvent('chked', {
                    detail: {
                        result: chk_result.result,
                        msg: chk_result.msg,
                        detail: chk_result.detail
                    }
                });

                var tooltip = getVueTooltipFromUp(chk_dom);
                if (tooltip) {
                    tooltip.$emit("chked", chkEvent);
                } else {
                    chk_dom.$emit("chked", chkEvent);
                }


                if (chk_result.result) {
                    chk_dom.$el.classList.remove("chk_error");
                    continue;
                }

                chk_dom.$el.classList.add("chk_error");

                if (singleShow) {
                    break;
                }
            }

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
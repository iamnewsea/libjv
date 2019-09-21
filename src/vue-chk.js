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
    Object.defineProperty(HTMLElement.prototype, "chk", {
        //chk_show:如何显示的回调.
        value: function (chk_show) {

            //
            var getInputDom = function (dom) {
                if (dom.tagName == "INPUT") {
                    return dom;
                }
                if (dom.tagName == "TEXTAREA") {
                    return dom;
                }

                if (!dom.childNodes.length ) return null;

                var domInput = dom.querySelector("input[type=hidden]")
                if (!domInput) {
                    domInput = dom.querySelector("input");
                }
                if (!domInput) {
                    domInput = dom.querySelector("textarea");
                }
                return domInput;
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

            //查找dom下第一个绑定 v-model 的值.如果找不到,则查找 inputDom 的值.
            // var getVModelValue = function (component) {
            //     var vdata = component.$vnode.data, ret;
            //     if (vdata && vdata.model && vdata.model.expression) {
            //         if ("value" in vdata.model) {
            //             return vdata.model.value || "";
            //         }
            //
            //         //对于 el-input 它的值在 component._data.currentValue,对于其它 v-model 它的值在  vdata.model.value
            //         ret = jv.evalExpression(component.$vnode.context._data, vdata.model.expression);
            //         if (ret.ok) {
            //             return ret.value;
            //         } else {
            //             ret = "";
            //         }
            //     }
            //
            //     for (var it of component.$children) {
            //         ret = getVModelValue(it)
            //         if (ret) {
            //             return ret;
            //         }
            //     }
            //     return ret;
            // }

            var isValidateChar = function (code) {
                if (code == 45 || code == 95) return true;
                if (code >= 65 && code <= 90) return true;
                if (code >= 97 && code <= 122) return true;
                if (code >= 48 && code <= 57) return true;

                return false;
            }
            //取下一个非字符。 减号下划线除外
            var getNextNonCharIndex = function (exp) {
                var chk_type_index = Array.from(exp).findIndex(it => {
                    return !isValidateChar(it.charCodeAt())
                });

                if (chk_type_index < 0) {
                    chk_type_index = exp.length;
                }
                return chk_type_index;
            }

            var chk_item = function (chk_dom,inputDom) {

                var chk = chk_dom.dataset.chk || chk_dom.getAttribute("chk") || "";
                chk = chk.trim();
                if (!chk) return "";
                var chk_error_msg = chk_dom.dataset.chkMsg || chk_dom.getAttribute("chk-msg") || chk_dom.placeholder || inputDom.placeholder ||  "请检查输入值";

                var chk_type_index = getNextNonCharIndex(chk),
                    chk_type = chk.slice(0, chk_type_index),
                    chk_body;

                if (chk[0] == ':') {
                    chk_type = ":";
                    chk_body = chk.slice(1);
                } else if (chk_type == "reg") {
                    if (chk[chk_type_index] != ':') {
                        return "[Error]正则表达式缺少冒号"
                    }
                    chk_body = chk.slice(chk_type_index + 1);
                } else {
                    chk_body = chk.slice(chk_type_index);
                }


                // var value = getVModelValue(chk_dom.__vue__);
                // if (value !== null) {
                // }
                // else {
                //     value = getInputValue(chk_dom);
                // }

                var value = inputDom.value;

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
                    return eval("(value,dom) => {" + chk_body + "}")(value, inputDom)
                } else if (chk_type == "reg") {
                    //如果不是类型，则整体按正则算。
                    var reg;
                    try {
                        reg = eval(chk_body);
                        return reg.test(value) ? "" : chk_error_msg;
                    } catch (e) {
                        return "正则表达式不正确";
                    }
                } else if (chk) {
                    //如果定义了 * 号,表示必填.
                    var chk_type2 = Object.keys(jv.chk_types).find(it => chk.startsWith(it)) || "";
                    if (chk_type2) {
                        chk_type = chk_type2;
                        chk_body = chk.slice(chk_type.length + 1).trim();
                    }

                    if (chk_type in jv.chk_types) {
                        var chk_type_ret = jv.chk_types[chk_type](chk_body, value, inputDom, chk_dom);

                        if (chk_type_ret === false) {
                            return chk_error_msg;
                        }

                        if (!chk_msg && chk_body) {
                            // chk_body.split("&")
                            var ret = jv.chk_range(chk_type, chk_body, value);
                            if (ret === false) {
                                return chk_error_msg;
                            }
                            if (ret && (ret.Type == "string")) {
                                return chk_error_msg + " " + ret;
                            }
                        }
                    } else {
                        return "[Error]不识别的类型" + chk_type;
                    }
                }

                return "";
            };
            //

            var ret = true, list = Array.from(this.querySelectorAll("[chk]"));
            // list = list.concat(Array.from(this.querySelectorAll("[data-chk]")))

            for (var chk_dom of list) {
                // inputDom.removeEventListener("blur", inputChanged);
                // inputDom.addEventListener("blur", inputChanged);
                //
                // //Chrome
                //
                // //可以通过 ev 传值。
                // var ev = inputDom.trigger("blur");
                var inputDom = getInputDom(chk_dom);
                if (!inputDom) return "找不到输入框";

                var chk_msg = chk_item(chk_dom,inputDom);

                if (!chk_msg) {
                    jv.chk_clear && jv.chk_clear({target: inputDom, chk_dom: chk_dom});
                    continue;
                }

                ret &= false;

                var chk_error_obj = {msg: chk_msg, type: "chk", target: inputDom, chk_dom: chk_dom};

                if (jv.chk_error) {
                    jv.chk_error(chk_error_obj);
                } else {
                    jv.error(chk_msg, "", chk_error_obj);
                }

                //即使没有消息,也要调用.使调用方隐藏提示.
                if (chk_show && (chk_show(chk_error_obj) === false)) {
                    break;
                }
            }

            return ret;
        }, enumerable: false
    });


//注册样式. 把 chk有值,且里面没有问号的元素,添加属性 chk-require ,供样式表显示必填样式.
// jv.Vue.mixin({
//   created(){
//
//   }
// })
})();
export default jv;
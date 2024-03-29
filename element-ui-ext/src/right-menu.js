/**
 * 扩展Vue组件的右键属性，使支持右键。
 * 使用方式：
 * 1. 组件上定义：v-menu:div1 (binding.arg) 或者  v-menu="div1" (binding.expression)
 * 2. 定义 ref=div1 的组件。
 */

export default {
    install(Vue) {
        Vue.directive('menu', {
            inserted(el, binding, vnode) {
                var ref = binding.arg || binding.expression,
                    menu = vnode.context.$refs[ref];

                if (menu) {
                    menu.classList.add("context-menu-hide");
                }

                el.addEventListener("contextmenu", function (ev) {
                    var menu = menu = vnode.context.$refs[ref];
                    if (!menu) return;

                    menu.target = ev.target;

                    var chkEvent = jv.createEvent("show", {cancelable: true});
                    menu.trigger(chkEvent);

                    if (chkEvent.defaultPrevented || (chkEvent.returnValue === false)) {
                        return;
                    }


                    ev.preventDefault();
                    menu.style.left = ev.pageX + "px";
                    menu.style.top = ev.pageY + "px";
                    menu.classList.remove("context-menu-hide");
                    menu.classList.add("context-menu-show");


                    document.once("click", function (event) {
                        var menu = menu = vnode.context.$refs[ref];
                        if (!menu) {
                            return;
                        }
                        var chkEvent = jv.createEvent("hide", {});
                        menu.trigger(chkEvent);
                        menu.classList.remove("context-menu-show");
                        menu.classList.add("context-menu-hide");
                    });
                    return false;
                });

                //添加样式表
                // if (!Array.from(document.styleSheets).filter(it => it.id == "style-contextmenu").length) {
                //
                //   var nod = document.createElement("style"),
                //     str = [".context-menu-hide{}",".context-menu-show{}"].join("\n");
                //   nod.type = "text/css";
                //   if (nod.styleSheet) {         //ie下
                //     nod.styleSheet.cssText = str;
                //   } else {
                //     nod.innerHTML = str;       //或者写成 nod.appendChild(document.createTextNode(str))
                //   }
                //   document.head.appendChild(style)
                // }
            }
        })
    }
}

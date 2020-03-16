/**
 * 扩展Vue组件的右键属性，使支持右键。
 * 使用方式：
 * 1. 组件上定义：v-menu:div1。
 * 2. 定义 ref=div1 的组件。
 */

export default {
  install(Vue) {
    Vue.directive('menu', {
      inserted(el, binding, vnode) {

        el.addEventListener("contextmenu", function (ev) {
          ev.preventDefault();
          var menu = vnode.context.$refs[binding.arg];
          menu.style.left = ev.pageX + "px";
          menu.style.top = ev.pageY + "px";
          menu.classList.remove("context-menu-hide");
          menu.classList.add("context-menu-show");


          setTimeout(() => {
            var chkEvent = jv.createEvent("show", {});
            menu.trigger(chkEvent);

            document.once("click", function (event) {
              var menu = vnode.context.$refs[binding.arg];
              if (menu) {
                var chkEvent = jv.createEvent("hide", {});
                menu.trigger(chkEvent);
                menu.classList.remove("context-menu-show");
                menu.classList.add("context-menu-hide");
              }
            });
          }, 0);
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

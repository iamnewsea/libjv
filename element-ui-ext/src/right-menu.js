export default {
  install(Vue) {
    Vue.directive('menu', {
      inserted(el, binding, vnode) {
        el.addEventListener("contextmenu", function (ev) {
          ev.preventDefault();
          var menu = vnode.context.$refs[binding.arg];
          menu.style.display = "block";
          menu.style.left = ev.pageX + "px";
          menu.style.top = ev.pageY + "px";
          return false;
        });

        document.addEventListener("click", function (event) {
          var menu = vnode.context.$refs[binding.arg];
          if (menu) {
            menu.style.display = "none";
          }
        });
      }
    })
  }
}

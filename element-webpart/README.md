# element-ui-ext
vue element ui extend

## 用法

```
import Vue from 'vue'
import App from './App'
import router from './router.js'
import axios from 'axios'
import ElementUI from 'element-ui/lib/index.js'
import ElementUIExt from 'element-ui-ext/lib/main.min'
import jv from "libjv"

(function (jv) {
  window.jv = jv;

  jv.initApp(Vue.prototype)
  jv.initAxios(axios);

  /*Vue.config.productionTip = false;*/
  Vue.use(ElementUI);
  Vue.use(ElementUIExt);
  Vue.prototype.$http = axios;
})(jv);


(function (jv) {
  let vue = new Vue({
    el: '#app',
    router,
    watch: {
      '$route'(to, from) {
      }
    },
    render(render) {
      return render(App);
    }
  });
})(jv);
```

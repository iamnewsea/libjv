# element-ui-ext
vue element ui extend
扩展了 element-ui 的一些组件.

>作者 imnewsea


![](https://gitee.com/uploads/74/1227074_imnewsea.png)

## 安装依赖包
> npm i --registry=https://registry.npm.taobao.org

## 发版到中央仓库
> npm publish

> cnpm sync libjv

## 用法
vue cli 3.0 用法:

[index.js](./doc/main.js)


## 插件:

> upload
> image-edit 使用 vue-cropperjs 进行裁剪。
> element-ui-ext 打包了 vue-cropperjs ，所以调用者项目不必安装 vue-cropperjs


    "@vue/eslint-config-standard": "^4.0.0",
    "babel-eslint": "^10.0.3",
    "@vue/cli-plugin-eslint": "^4.1.1",
    "eslint": "^5.16.0",
    "eslint-plugin-vue": "^6.0.1",


### tab-iframe 应用
定义两个 vue:

1. container.vue 
```
 <tabs />
```

tabs.vue
```
<tab-iframe ref="tab" v-menu:m1 style="flex: 1;display: flex;flex-direction: column;"></tab-iframe>
```

2. component.vue

```
"$route": {
            immediate: true, deep: true, handler() {
                var path = this.$route.path;
                if (path == "/") return;
                var url = BASE_URL.slice(0, -1) + path
                if (url == top.location.pathname) return;
                top.history.pushState('', '', url);
                history.replaceState('', '', url);

                //这里要触发 localState 的改变
                // var tabs = localStorage.getJson(jv.tabs_key);
                var tabName = this.$route.meta.tab || "首页";
                top.jv.tabIframe.setTab(tabName,path)
            }
        }
```
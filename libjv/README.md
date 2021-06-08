# libjv

## yarn镜像
推荐使用 `yarn` 做包管理。`.yarnrc` 中定义了 yarn 镜像。注意：`registry` 在安装和发版时是不一样的。

如果发布到 `cnpm` ，使用 `cnpm sync libjv` 进行同步。

## 环境变量

定义 `VUE_APP_USER_SYSTEM` 变量，表示对 LocalStorage 的 key 添加统一的前缀。  
定义 `VUE_APP_SERVER_HOST` 变量，表示 Axios 请求头。

## 使用方式
引入 `libjv` 后，会在 `window` 对象上添加 `jv` 属性。大部分方法都可以通过 `window.jv` 调用，另外一部分扩展到了各对象的原型上，如（String。prototype.replaceAll 方法）。

`main.js` 
```js 
jv.initVue({vue: Vue, axios: axios, router: router, elementUI: window.ELEMENT});
```

jv.initVue 初始化Vue环境，该方法的作用如下：

    1. 定义了 message 事件，在下载文件出错时，iframe 页面会通过 postMessage 来传递错误消息。
    2. 把 VUE_APP_开头的变量，赋值到 window 对象上，并去除 VUE_APP_ 前缀。
    3. 定义 window.BASE_URL
    4. 定义 jv.USER_SYSTEM = window.USER_SYSTEM
    5. 对各对象原型进行扩展。后续分批介绍。
    6. 对 Vue 进行了混入：对所有 chk 项添加了  must 必填样式。
    7. 设置了 axios , element-ui 的默认参数值 
    8. 定义 jv.token = LocalStorage["token"]

### 修改了 Axios 默认值：
    
    1. withCredentials=true
    2. baseURL = window.SERVER_HOST
    3. headers['Content-Type'] = 'application/json; charset=UTF-8'
    4. transformRequest 对 json 序列化传输。
    5. request 拦截器：允许请求外部链接。
    6. response 拦截器，提示系统错误。 对 response.data.msg 按错误处理（可通过 response.config.msgIsError = false 来忽略 msg 错误）。 对返回结果资源化（可通过 response.config.fillRes = false 忽略资源化） ，资源化是对 布尔，时间类型添加相应的 _res 字段显示中文值。 
    7. 统一处理了 401,403,404,500，网络中断的错误。

### 修改了 ElementUI 默认值：

    ELEMENT.Button.props.size.default = "mini"
    ELEMENT.Input.props.size.default = "small"
    ELEMENT.Table.props.rowKey.default = "id";
    ELEMENT.Table.props.rowKey.default = "id";
    ELEMENT.Dialog.props.closeOnClickModal.default = false
    ELEMENT.Dialog.props.top.default = "";

    设置弹出框动态居中。

### 扩展了 Vue 原型的以下方法：
 
    1. $loadQuery: 根据当前url保存页面查询条件
    2. $saveQuery：根据当前url 加载页面查询条件 
    3. $resetData: 重置当前页面的数值。
    4. chk_item： 单项数据校验。
    5. chk： 整体数据校验。
    6. $getVModelData ： 查找dom下第一个绑定 v-model 的值.返回结构 { vnode : v-model 对象, value : v-model 的值, data }
    7. $getBindExpression： 获取绑定表达式
    7. $RecursionVNode:  递归查找 vnode
    8. $Closest: 按组件名向上查找
    9. $done: 事件， 调用该事件后，将触发 jv.vue_spa_render_event = "render-event" 事件。
    10. 
 

### 扩展了 HTMLElement 原型的以下方法：

    1. chk_item: 单项数据校验。
    2. chk 整体数据校验。
    3. $Closest： 按Vue组件名向上查找。
    4. 

### jv 方法

    1. jv.main: Vue项的容器组件。部分需要当前路由的jv函数需要它。
    1. jv.getIdFromUrl 从Url中去除特殊字符，获取合法Id值。
    2. jv.getRouteMetaTabName 从当前路由获取 meta.tab 名称
    3. 


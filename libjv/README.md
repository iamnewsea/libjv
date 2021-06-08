# libjv


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



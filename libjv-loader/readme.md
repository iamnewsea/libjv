# libjv-plugin 
作用：

1. 在编译时编译 多语言组件,`<c>` `<e>` 分别表示中文和英文
2. 编译时替换变量： @{去除VUE_APP_前缀的变量名}@
3. 编译 `<inline-res>`  标签。


1. package.json  devDependencies 添加：
```
yarn add libjv-loader -D
```

2. vue.config.js ：
```
    configureWebpack: config => {
        config.module.rules.push(...[
            {
                 test: /\.(vue)$/,
                 use: [{
                     loader: 'libjv-loader'
                 }]
            }
        ])
        const libjvPlugin = require("libjv-plugin")
        config.plugins.push(new libjvPlugin())
    }
```

或者：
```
    chainWebpack:config=>{
        //或者用这种方式,或者用上面 configureWebpack 的方式，二选一进行配置。

        const libjvPlugin = require("libjv-plugin")
        config.plugin("libjv-plugin").use(libjvPlugin)

        config.module.rule("vue").use("libjv-loader").loader("libjv-loader")
    }
```

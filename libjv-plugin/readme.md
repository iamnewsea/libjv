# libjv-plugin 

在编译时动态生成 hi.html，显示更多信息。

1. package.json  devDependencies 添加：
```
yarn add libjv-plugin -D
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

在编译时，自动生成 /dist/hi.html。
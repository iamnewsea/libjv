# libjv-plugin 

在编译时动态生成 hi.html，显示更多信息。

1. package.json  devDependencies 添加：
```
yarn add libjv-plugin -D
```

2. vue.config.js 添加：
```
const libjvPlugin = require("libjv-plugin")
config.plugins.push(new libjvPlugin({hi: true}))
```

在编译时，自动生成 /dist/hi.html。
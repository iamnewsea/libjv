# 说明

项目包括以下部分：
- libjv 是Es6的基础扩展，有少量 vue 扩展 。 
- element-ui-ext 是基于 element-ui 的扩展。
- element-webpart 是基于element-ui 的公共页面级组件。它不应该被包装成组件。 之前会把它移到各个项目。

> npm install -g cnpm --registry=https://registry.npm.taobao.org

## 安装依赖包
path 添加 python2
> set path=%path%;C:\Python27
> copy c:\python27\python.exe c:\python27\python2.exe
> npm install -g  node-sass --registry=https://registry.npm.taobao.org
>
------以上方法是下载后编译，比较慢。

---- 使用以下方法下载编译后版本，比较快。

> npm i -g node-sass@4.14.1 --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
> npm i -g @vue/cli --registry=https://registry.npm.taobao.org
> npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
> npm i --registry=https://registry.npm.taobao.org
> 指定版本： npm i -g @vue/cli@^4.1.1 --registry=https://registry.npm.taobao.org
>作者 imnewsea

---
> yarn global add node-sass@4.14.1 --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
> yarn global add @vue/cli --registry=https://registry.npm.taobao.org
> yarn --registry=https://registry.npm.taobao.org
![](https://gitee.com/uploads/74/1227074_imnewsea.png)


## 系统设置

系统 .yarnrc 两个文件地址：

> /root/.yarnrc
> /usr/local/share/.yarnrc

运行：
> yarn config set registry https://registry.npm.taobao.org

## 发布到nexus
>https://www.e-learn.cn/topic/2624958
本地 .yarnrc 变量内容会覆盖系统目录的 .yarnrc 变量内容。

安装包使用：

> 运行 yarn config list
> 检查项目文件 .yarnrc registry 配置，设置到淘宝或注释。
> yarn

发版使用：
```
运行 yarn config list
检查项目文件 .yarnrc registry 配置，设置到私服 npm-hosted
yarn
yarn login
yarn publish
```

如果使用npm发版：
```
npm config set registry http://saas-dev.nancal.com:31016/repository/npm-hosted/
npm login
npm publish
```
如果yarn login出现异常，查看配置文件:

> C:\Users\[your user name]\.npmrc
> C:\Users\[your user name]\.yarnrc

可以清空，重新配置！

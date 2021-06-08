# 概述

## 使用yarn
推荐使用 `yarn` 做包管理。`.yarnrc` 中定义了 yarn 镜像。注意：`registry` 在安装和发版时是不一样的。

如果发布到 `cnpm` ，使用 `cnpm sync libjv` 进行同步。

#### 如果发到私服:
> registry "http://saas-dev.nancal.com:31016/repository/npm-hosted/"

#### 如果使用私服:
> registry "https://registry.npm.taobao.org"  
或  
> registry "http://saas-dev.nancal.com:31016/repository/npm-group/"

### 版本：
npm包版本只支持三级版本号： 主版本.次版本.修订版本


# 项目环境变量

定义 `VUE_APP_USER_SYSTEM` 变量，表示对 LocalStorage 的 key 添加统一的前缀。  
定义 `VUE_APP_SERVER_HOST` 变量，表示 Axios 请求头。  
`jv.main` : Vue项的容器组件。部分需要当前路由的jv函数需要它。

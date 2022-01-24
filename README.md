# vqiankun 支持vue2 和 vue3

> 安装 npm i vqiankuan

## 疑问解答

- 为方便编码，尽量将vue2/3 的api设置为一致，其余保持vue2/3的原本特性
- 采用vue 生命周期常规命名方便理解
- 如何访问子应用，子应用访问是父应用路由加上子应用的名称即可访问 例如：localhost:8080/sub1 ,sub1 是子应用名称
- 为什么不能设置 router 的 baseUrl？ 为降低使用复杂度，由于子应用名称作为入口，为降低思考成本，去掉自已应用的baseUrl的设置。

## 导入配置

vue2 从 `vqiankun/vue2` 导入
vue3 从 `vqiankun/vue3` 导入

## Api

- `createMainApp`

| 参数           | 描述                                   |
| -------------- | -------------------------------------- |
| routes         | 路由表                                 |
| mode           | 路由模式，必选                         |
| entryComponent | 入口组件                               |
| mount          | 挂载点                                 |
| subApps        | 子应用列表                             |
| hook           | 钩子函数可选，可返回 vue实例 和 router |

- `createSubApp`

| 参数           | 描述                               |
| -------------- | ---------------------------------- |
| routes         | 路由表                             |
| mode           | 路由模式，必选                     |
| entryComponent | 入口组件                           |
| mount          | 挂载点                             |
| hook           | 钩子函数，可返回 vue实例 和 router |
| created        | 钩子函数，子应用创建完成           |
| mounted        | 钩子函数，子应用挂载创建完成       |
| unmounted      | 钩子函数，子应用卸载完成           |

## 例子

- 主应用
```js
import { createMainApp } from "vqiankun/vue3"
createMainApp({
    routes: routes,
    mode: 'history',
    entryComponent: App,
    mount: "#app",
    subApps: apps, //子应用列表
    hook({ app, router }) {
        app.use(store) //vue2 此处应该为 Vue.use
    }
})
```

- 子应用
```js
import "vqiankun/public-path" //首行导入
import { createSubApp } from "vqiankun/vue3"

export const { bootstrap, mount, unmount } = createSubApp({  //此处必须抛出 bootstrap, mount, unmount
    routes: routes,
    mode: 'history',
    mount: "#sub1", //index.html 的id，一般以应用名称作为Id 比较容易辨识
    entryComponent: App,
})

```

## `vue.config.js` 环境配置（仅限子应用，父应用无需配置）

```js
const { name } = require("./package");  //导入应用名称，子应用名称必须是唯一
module.exports = {
  devServer: {
    port: 1111, //子应用端口号必须是固定
    headers: {
      "Access-Control-Allow-Origin": "*", // 允许子应用跨域
    },
  },
  // 自定义webpack配置
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd", // 把子应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
```
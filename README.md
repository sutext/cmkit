# CMKit

-   通用 web 开发工具包，同时支持 web 开发 egret 游戏开发 和 cocos creator 游戏开发

## 说明

-   cmkit 是一款支持 typescript 的前端通用工具集合 cm 为 common 的简写
-   cmkit 可用于前端 web，cocoscoreator 游戏，egret 游戏的开发
-   cmkit 提供高度可配置的 network api。
-   cmkit 提供自动重连和自动 ping pong websokect api
-   cmkit 提供装饰器模式的 orm 对象存储 api

## web 网页开发

-   npm i cmkit --save
-   需要在工程入口文件引入 cmkit 以激活

```ts
import 'cmkit';
```

## cocos creator 游戏开发

-   npm i cmkit --save-dev
-   cmkit 将以插件的形式安装到 pacakges 目录下面
-   扩展 cocos creator 的基础库 增加大量实用工具
-   cmkit 将同步安装 cocos creator 的声明文件

## egret 游戏开发

-   npm i cmkit --save-dev
-   cmkit 将以第三方包的形式安装在 libs 目录下面
-   cmkit 将自动配置 egretProperties.json

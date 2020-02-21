*中文|[English](README.zh.md)*
## Coderlane

Coderlane是一款在线实时编程环境, 高保真的REPL环境. 同时支持多人编程，语音和视频(感谢[Agora](http://agora.io)提供的服务)

## 界面截图

<p align="center">
  <img alt="coderlane" src="https://user-images.githubusercontent.com/18432680/64065012-eb569400-cc3a-11e9-86fb-3cbfcbfd2699.png">
</p>

## 运行

运行依赖`docker`、`mongodb`、`nodejs`确定你都正常安装以上软件

* 将`.env.example`重命名为`.env`并根据提示里面的配置填入值

* `npm i`安装程序依赖

* 启动一个控制台运行`npm run build`

* 启动另外一个控制台运行`npm run server`

访问浏览器`http://localhost:3000`, 使用github登录即可创建.

## Special Thanks

[![AGORA.IO](https://www.agora.io/en/wp-content/uploads/2019/06/agoralightblue-1.png)](https://www.agora.io/)

## License
This software is under the MIT License (MIT).

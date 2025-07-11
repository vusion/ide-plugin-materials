# 🌟 插件 - test-plugin

## 📚 概述

本插件主要用来注入定制的业务脚本代码，比如：定制全局样式、对接私有客服入口等。默认初始化代码在右下角添加了一个《点击》按钮。

## 🛠 功能特性

以下是本项目的核心功能：

**脚本注入**：注入定制的业务脚本代码。\
**调试开发**：支持线上低代码编辑器运行本地插件代码，实现调试功能。\
**部署上线**：支持通过命令行工具部署插件代码到线上环境。

## 🚀 快速开始

### 1. 环境准备

在开始之前，请确保您的开发环境中已安装以下工具：

```Node.js``` (>= 18.x) \
```npm```

### 2. 安装依赖

运行以下命令以安装项目依赖：

```bash
npm install
```

### 3.启动本地调试服务

执行以下命令以启动本地开发环境：

```bash
npm run dev
```

### 4.注入本地插件代码

按照以下步骤完成插件的代码注入：

**1.** 浏览器打开应用 IDE 控制台，执行以下代码；

```javascript
window.$plugin.setPluginToLocal('inner')({
  symbol: 'test-plugin',
  version: '3.10',
  type: 'inner',
  name: '名称',
  description: '描述',
  config: '{"_developScriptURL":"https://localhost:1613/index.js"}',
});

```

**2.** 刷新页面后，《插件管理》-《已安装插件》中插件已经安装；

### 5.定制脚本代码开发

业务组件默认代码文件 ```src/index.js```，可通过 ```bootstrap``` 的入参读取业务配置数据，代码示例如下：

```javascript
const bootstrap = (options) => {
  console.log('业务配置数据：', options);
};

export default {
  ...
  bootstrap,
};
```

## 🔧 配置说明

### 插件配置

该配置包含插件在管理面板中的展示数据，以及业务运行所需的初始数据。

#### 配置文件

主要配置文件为 ```description.json```，其结构如下：

```javascript
{
  ...
  // 插件名称，显示在插件管理界面
  "name": "名称",
  // 插件描述，显示在插件管理界面
  "description": "文本描述",
  // 插件是否开启默认加载
  "default": false,
  // 插件运行时业务默认数据，采用 JSON 格式存储
  "config": "{}"
}
```

#### 参数详解

| 参数名 | 类型 | 默认值 | 描述 | 
| --- | --- | --- | --- |
| ```name``` | ```string``` | ```""``` | 插件名称，显示在插件管理界面。 |
| ```description``` | ```string``` | ```""``` | 插件描述，显示在插件管理界面。 |
| ```default``` | ```boolean``` | ```false``` | 插件是否开启默认加载。 |
| ```config``` | ```string``` | ```{}``` | 插件运行时业务默认数据，采用 ```JSON``` 格式存储。 ```Vue``` 组件通过 ```Pros/Attrs``` 读取。 |

## 🌐 线上部署

### 1.安装全局 ```lcap``` 命令

参考 [前端依赖库开发配置指南](https://community.codewave.163.com/CommunityParent/fileIndex?filePath=40.%E6%89%A9%E5%B1%95%E4%B8%8E%E9%9B%86%E6%88%90%2F10.%E6%89%A9%E5%B1%95%E5%BC%80%E5%8F%91%E6%96%B9%E5%BC%8F%2F20.%E5%89%8D%E7%AB%AF%E6%89%A9%E5%B1%95%E5%BC%80%E5%8F%91%2F09.%E5%89%8D%E7%AB%AF%E4%BE%9D%E8%B5%96%E5%BA%93%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.md&version=3.9) 完成环境配置，安装全局命令：

```bash
npm install -g lcap@latest
```

### 2. 安装依赖

运行以下命令以安装项目依赖：

```bash
npm install
```

### 3.部署到线上环境

执行以下命令完成插件的打包与发布：

```bash
npm run release
```

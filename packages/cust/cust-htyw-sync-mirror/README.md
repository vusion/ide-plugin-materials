# 🌟 插件 - cust-htyw-sync-mirror

## 📚 概述

本插件支持将 ```Vue``` 组件渲染至指定的 ```Skeleton``` 节点，实现基于该节点的替换、插入等操作。默认初始化代码通过插入 ```left-side-nav/main/test``` 节点，在左侧边栏添加了一个《点击》按钮。

## 🛠 功能特性

以下是本项目的核心功能：

**插件配置**：支持业务初始数据、```Skeleton``` 节点配置。\
**组件渲染**：支持将 ```Vue``` 组件渲染至指定的 ```Skeleton``` 节点。\
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
  symbol: 'cust-htyw-sync-mirror',
  version: '3.10',
  type: 'inner',
  name: '名称',
  description: '描述',
  config: '{"_developScriptURL":"https://localhost:1613/index.js"}',
});

```

**2.** 刷新页面后，《插件管理》-《已安装插件》中插件已经安装；\
**3.** 如需查看编辑器内部已有 ```Skeleton``` 节点，可在控制台输入以下命令：

```javascript
// 开启高亮 Skeleton 节点
window.$plugin.showSkeleton();
// 关闭高亮 Skeleton 节点
window.$plugin.hideSkeleton();

```

### 5.组件业务功能开发

业务组件默认代码文件 ```src/components/render/index.vue```，可通过 ```Props/Attrs``` 读取业务配置数据，代码示例如下：

```javascript
<script setup>
import { useAttrs } from 'vue';

// 通过 Props 读取业务配置数据
const props = defineProps({ ... });

// 通过 Attrs 读取业务配置数据
const attrs = useAttrs();
</script>  
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

### Skeleton 节点配置

该配置包含用于渲染 ```Vue``` 组件的 ```Skeleton``` 节点名称，以及具体的渲染操作类型（如替换、插入等）。

#### 配置文件

主要配置通过修改 ```src/index.js``` 代码实现，示例如下：

```javascript
import { createPlugin } from 'opp-tools';

import Render from '@/components/render';

const plugin = {
  ...
  // 渲染操作
  method: 'insert',
  // Skeleton 节点名称
  container: 'left-side-nav/main/test',
};

export default createPlugin(Render)(plugin);

```

#### 参数详解

| 参数名 | 类型 | 默认值 | 描述 | 
| --- | --- | --- | --- |
| ```container``` | ```string``` | ```""``` | ```Skeleton``` 节点名称，通过 ```/``` 划分节点层级。 |
| ```method``` | ```enum``` | ```"insert"``` | ```Skeleton``` 节点的操作方式，以下为详细配置。 |

| method | 描述 | 
| --- | --- |
| ```"hide"``` | 隐藏当前节点。 |
| ```"show"``` | 显示当前节点。 |
| ```"remove"``` | 移除当前节点。 |
| ```"replace"``` | 替换同名节点。 |
| ```"append"``` | 将当前节点插入父级节点尾部。 |
| ```"unshift"``` | 将当前节点插入父级节点头部。 |
| ```"insert"``` | 若当前节点存在则替换，否则插入至父级节点尾部。 |

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

import { getPlugin } from "opp-core"
const skeleton = getPlugin("skeleton")

const hideNodes = [
  // 顶部导航
  "top/right/connector-center", // 集成
  "more-menu/config-manager", // 应用配置
  "more-menu/i18n-config", // 国际化多语言
  "more-menu/plugin-manager", // 插件管理
  "top/right/release", // 发布

  // 更多
  // 自定义主题样式
  "theme-setting/aside",
  // "theme-setting/header/search", // 组件搜索 （⚠️：使用hide方法不生效，改为更高优先级的skeleton-portal组件的hide）
  "more-menu/share-manager", // 共享管理

  // 侧边栏
  "left-side-nav/main/Logic", // 逻辑
  "left-side-nav/main/Data", // 数据
  "left-side-nav/main/Process", // 逻辑
  // "left-side-nav/rest/Feedback", // 客服
  // "left-side-nav/rest/Help", // 帮助
  // "left-side-nav/rest/Complaint", // 吐槽
]

// 启动回调, 隐藏节点
export const mount = (options) => {
  hideNodes.forEach((item) => {
    skeleton?.hide?.(item)
  })
}

// 卸载回调, 显示节点
export const unmount = () => {
  hideNodes.forEach((item) => {
    skeleton?.show?.(item)
  })
}

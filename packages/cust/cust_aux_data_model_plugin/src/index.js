import { createPlugin } from 'opp-tools';

import Render from '@/components/render';

const plugin = {
  name: 'cust_aux_data_model_plugin',
  /**
   * Skeleton 节点的操作方式
   * 
   * hide - 隐藏当前节点
   * show - 显示当前节点
   * remove - 移除当前节点
   * replace - 替换同名节点
   * append - 将当前节点插入父级节点尾部
   * unshift - 将当前节点插入父级节点头部
   * insert - 若当前节点存在则替换，否则插入至父级节点头部
   */
  method: 'insert',
  /**
   * 对应 Skeleton 节点名称
   * 
   * 低代码编辑器控制台输入 $plugin.showSkeleton()，
   * 查看编辑器内部已有 Skeleton 节点。
   */
  container: 'left-side-nav/main/test2',
  dependencies: ['store-ide', 'store-app', 'skeleton'],
};

export default createPlugin(Render)(plugin);

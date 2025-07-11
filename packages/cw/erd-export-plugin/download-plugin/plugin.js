import { createPlugin as createVuePlugin } from 'opp-vue';
import { createPlugin as createStorePlugin } from 'opp-store';

import Render from './components/render/index.vue';

const initialState = {};

const plugin = {
  // 必填
  name: 'erd-export-plugin',
  // 如果插件需要渲染交互，container 必填
  container: 'erd-export-plugin-download-container',
};

const renderPlugin = createVuePlugin(Render)(plugin);
const storePlugin = createStorePlugin(initialState)(renderPlugin);

export default storePlugin;

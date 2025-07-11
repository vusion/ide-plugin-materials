import plugin from './plugin';

const bootstrap = (config) => {
  plugin.hooks.setState(config);
};

export default bootstrap;

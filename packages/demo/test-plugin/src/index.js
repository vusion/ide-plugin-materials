import './style.scss';

const id = 'plugin-button';

const bootstrap = (options) => {
  const json = JSON.stringify(options, null, 2);
  const element = document.createElement('button');

  const click = () => alert(`插件已安装，业务初始数据如下：\n${json}`);

  element.id = id;
  element.innerHTML = '点击';
  element.addEventListener('click', click);

  document.body.appendChild(element);
};

const unmount = () => {
  const element = document.getElementById(id);

  element?.remove?.();
  alert('插件已卸载，需要手动清理插件的副作用。\n比如：插件添加的定制全局样式，卸载后需要手动移除。');
};

export default {
  unmount,
  bootstrap,
  name: 'test-plugin',
  dependencies: ['store-ide', 'store-app', 'skeleton'],
};

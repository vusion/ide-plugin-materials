import { getPlugin } from 'opp-core';

const extraTypes = ['扩展'];

const businessIdeUsage = { _kind: '扩展' };

const sortedCategories = [
  'Layout',
  '布局',
  'Navigation',
  '导航',
  'Container',
  '容器',
  'Display',
  '展示',
  'Table',
  '表格',
  'Form',
  '表单',
  'Selector',
  '选择器',
  'Chart',
  '图表',
  'Feedback',
  '反馈',
  'Effects',
  '特效',
  'Process',
  '流程',
];

const isEnabled = () => true;

const getKind = (source) => source?.ideusage?._kind;

const sortList = (...list) => {
  const store = sortedCategories.reduce(
    (result = {}, item, index) => {
      result[item] = index;

      return result;
    },
    {},
  );

  const forEach = (item = {}) => {
    const category = item?.category;
    const included = category in store;

    if (!category || included) {
      return;
    }

    store[category] = sortedCategories.length;
    sortedCategories.push(category);
  };

  const sort = (a, b) => {
    const aIndex = store[a?.category];
    const bIndex = store[b?.category];

    return aIndex >= bIndex ? 1 : -1;
  };

  list.forEach(forEach);
  return list.sort(sort);
};

const getTypesFromSource = (source = []) => {
  const kinds = source.map(getKind).filter(Boolean);
  const merged = kinds.concat(extraTypes);

  const set = new Set(merged);
  const strings = Array.from(set);

  const types = strings?.map((item) => {
    const label = item?.label || item;
    const value = item?.value || item;

    return { label, value };
  });

  return types;
};

const missions = [
  () => {
    const componentToolbox = getPlugin('component-toolbox');
    const componentPanelSetting = getPlugin('component-panel-setting');

    componentToolbox.isEnabled.tap('huadian-plugin.isEnabled', isEnabled);
    componentPanelSetting.isEnabled.tap('huadian-plugin.isEnabled', isEnabled);
  },
  () => {
    const componentToolbox = getPlugin('component-toolbox');

    const getTypes = (state = {}) => {
      const {
        originBasicList = [],
        originCustomList = [],
      } = state;

      const source = sortList(
        ...originBasicList,
        ...originCustomList,
      );

      return getTypesFromSource(source);
    };

    componentToolbox.getTypes.tap('huadian-plugin.getTypes', getTypes);
  },
  () => {
    const componentToolbox = getPlugin('component-toolbox');

    const getList = (context = {}) => {
      const {
        type,
        basicList: contextBasicList = [],
        customList: contextCustomList = [],
        businessList: contextBusinessList = [],
      } = context;

      const basicList = contextBasicList.map((item = {}) => {
        return { _type: 'basic', ...item };
      });

      const customList = contextCustomList.map((item = {}) => {
        return { _type: 'custom', ...item };
      });

      const businessList = contextBusinessList.map((item = {}) => {
        return { _type: 'business', ideusage: businessIdeUsage, ...item };
      });

      const filter = (item) => getKind(item) === type;
      const source = sortList(
        ...basicList,
        ...customList,
        ...businessList,
      );

      return source.filter(filter);
    };

    componentToolbox.getList.tap('huadian-plugin.getList', getList);
  },
  () => {
    const componentPanelSetting = getPlugin('component-panel-setting');

    const getTypes = (state = {}) => {
      const {
        basicsList = [],
        hiddenList = [],
        extensionsList = [],
      } = state;

      const map = (item) => item.declaration;

      const reduce = (result = [], item = {}) => {
        const { list = [] } = item;
        const mapped = list.map(map);

        result.push(...mapped);
        return result;
      };

      const merged = sortList(
        ...basicsList,
        ...hiddenList,
        ...extensionsList,
      );

      const source = merged.reduce(reduce, []);

      return getTypesFromSource(source);
    };

    componentPanelSetting.getTypes.tap('huadian-plugin.getTypes', getTypes);
  },
  () => {
    const componentPanelSetting = getPlugin('component-panel-setting');

    const getList = (state = {}) => {
      const {
        tab,
        hiddenList = [],
        basicsList: originBasicsList = [],
        extensionsList: originExtensionsList = [],
      } = state;

      const basicsList = originBasicsList.map((item = {}) => {
        return { _tab: 'basic', ...item };
      });

      const extensionsList = originExtensionsList.map((item = {}) => {
        return { _tab: 'extension', ...item };
      });

      const merged = sortList(
        ...basicsList,
        ...extensionsList,
      );

      const reduceWithRecorder = (recorder = new Set()) => (result = [], item = {}) => {
        const { name } = item;

        const hidden = hiddenList.includes(item);
        const included = recorder.has(name);

        const kind = getKind(declaration);
        const matched = kind === tab;

        if (matched && !hidden && !included) {
          recorder.add(name);
          result = result.concat(item);
        }

        return result;
      };

      const filted = merged.reduce((result = [], item = {}) => {
        const { list: itemList = [] } = item;

        const reduce = reduceWithRecorder();
        const list = itemList.reduce(reduce, []);

        const useful = !!list.length;
        const current = { ...item, list };

        return useful ? result.concat(current) : result;
      }, []);

      const keys = [];

      const source = filted.reduce((result = {}, item = {}) => {
        const { value } = item;

        if (result[value]) {
          const previous = result.value?.children || [];
          const children = previous.concat(item);

          result[value] = { ...item, children };
        } else {
          result[value] = item;
          keys.push(value);
        }

        return result;
      }, {});

      return keys.map((key) => source[key]);
    };

    componentPanelSetting.getList.tap('huadian-plugin.getList', getList);
  },
  () => {
    const element = document.createElement('STYLE');

    element.innerHTML = `.component-panel-setting-button { display: none !important }`;
    document.head.appendChild(element);
  },
];

const bootstrap = () => {
  missions.forEach((mission) => mission());
};

export default bootstrap;

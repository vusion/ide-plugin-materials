import emptyLeftLight from './assets/empty-left-light.png';
import emptyRightLight from './assets/empty-right-light.png';

const replaceSVGColor = (() => {
  const list = [
    { source: '#3377FF', target: '#009D85' },
    { source: '#337EFF', target: '#009D85' },
    { source: '#576DFF', target: '#009D85' },
    { source: '#4D88FF', target: '#009D85' },
    { source: '#4C88FF', target: '#009D85' },
    { source: '#CBDCFF', target: '#D2F4F4' },
    { source: '#1FA2FF', target: '#33B19D' },
    { source: '#89B0FF', target: '#8ED6C0' },
    { source: '#99BBFF', target: '#8ED6C0' },
  ];

  return () => {
    list.forEach((item = {}) => {
      const { source, target } = item;

      const selector = `[fill="${source}"]`;
      const nodes = document.querySelectorAll(selector);
      const array = Array.from(nodes);

      array.forEach((element) => {
        element.setAttribute('fill', target);
      });
    });
  };
})();

const replaceEmptyImg = (() => {
  const list = [
    { id: 'emptyLeft', src: emptyLeftLight },
    { id: 'emptyRight', src: emptyRightLight },
  ];

  return () => {
    const map = (item = {}) => {
      const { id, src } = item;

      return `#${id} { content: url(${src}) }`;
    };

    const css = list.map(map).join('\n');
    const style = document.createElement('style');

    style.setAttribute('type', 'text/css');
    style.innerHTML = css;

    document.head.appendChild(style);
  };
})();

const bootstrap = () => {
  replaceSVGColor();
  replaceEmptyImg();
};

export default bootstrap;

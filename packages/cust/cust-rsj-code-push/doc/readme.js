import 'github-markdown-css/github-markdown-light.css';

import './readme.scss';

import readme from '../README.md';

const element = document.createElement('div');

element.classList.add('markdown-body');
element.innerHTML = readme;

document.body.appendChild(element);

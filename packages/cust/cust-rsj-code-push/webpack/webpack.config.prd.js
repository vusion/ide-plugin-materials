const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { merge } = require('webpack-merge');

const base = require('./webpack.config.js');

const packageObject = require('../package.json');
const descriptionObject = require('../description.json');

const ROOT_PATH = path.resolve(__dirname, '../');

const { name } = packageObject;
const { version } = descriptionObject;

const manifest = `Plugin-Version: ${version}

packages/plugin/${name}@${version}/dist/${name}.js: ${name}.js
packages/plugin/${name}@${version}/dist/${name}.js.map: ${name}.js.map
packages/plugin/${name}@${version}/description.json: description.json
packages/plugin/${name}@${version}/manifest: manifest
`;

class ZipPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('ZipPlugin', (compilation) => {
      const outputDir = compiler.options.output.path;
      const outputZip = path.join(
        './',
        `${name}@${version}.zip`
      );

      const buffer = Buffer.from(manifest);

      const output = fs.createWriteStream(outputZip);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // 压缩级别
      });

      archive.pipe(output);
      archive.directory(outputDir, false);
      archive.append(buffer, { name: 'manifest' });
      archive.file('./description.json', { name: 'description.json' })
      archive.finalize();
    });
  }
}

const more = {
  output: {
    library: name,
    libraryTarget: 'window',
    filename: `${name}.js`,
    path: path.resolve(ROOT_PATH, './dist'),
  },
  plugins: [new ZipPlugin()],
};

(() => {
  const object = { ...packageObject, version };
  const content = JSON.stringify(object, null, 2);
  const file = path.resolve(ROOT_PATH, './package.json');

  fs.writeFileSync(file, content)
})();

module.exports = merge(base, more);

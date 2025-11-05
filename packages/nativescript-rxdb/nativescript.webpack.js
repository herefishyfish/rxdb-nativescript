const { resolve } = require('path');
const appRoot = require('app-root-path');

module.exports = (webpack) => {
  webpack.chainWebpack((config) => {
    const nodeModulesPath = webpack.Utils.project.getProjectFilePath('node_modules');

    // Fix and patch imports
    config.resolve.alias.set('isomorphic-ws', resolve(appRoot.path, './node_modules/isomorphic-ws/browser.js'));
    config.resolve.alias.set('isomorphic-fetch', resolve(nodeModulesPath, '@nativescript/core'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set(resolve(appRoot.path, './node_modules/unload/dist/es/browser.js'), resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/unload/browser.js'));
  });
};

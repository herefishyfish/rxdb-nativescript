const webpack = require('@nativescript/webpack');
const { resolve } = require('path');
const appRoot = require('app-root-path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('angular');

  webpack.chainWebpack((config, env) => {
    // shared demo code
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));
    config.resolve.alias.set('@herefishyfish/requery-sqlite', resolve(__dirname, 'node_modules', '@herefishyfish', 'requery-sqlite'));

    const nodeModulesPath = webpack.Utils.project.getProjectFilePath('node_modules');

    // Fix and patch imports
    config.resolve.alias.set('isomorphic-ws', resolve(appRoot.path, './node_modules/isomorphic-ws/browser.js'));
    config.resolve.alias.set('isomorphic-fetch', resolve(nodeModulesPath, '@nativescript/core'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set(resolve(appRoot.path, './node_modules/unload/dist/es/browser.js'), resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/unload/browser.js'));
  });

  return webpack.resolveConfig();
};

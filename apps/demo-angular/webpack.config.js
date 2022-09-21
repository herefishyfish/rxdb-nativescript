const webpack = require('@nativescript/webpack');
const { resolve } = require('path');
const { NormalModuleReplacementPlugin } = require('webpack');
const appRoot = require('app-root-path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('angular');

  webpack.chainWebpack((config, env) => {
    // shared demo code
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));

    config.resolve.alias.set('pouchdb-md5', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/nativescript-rxdb/pouchdb'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set('uuid', resolve(resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/nativescript-rxdb/uuid'));
    config.resolve.alias.set('isomorphic-fetch', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@nativescript/core'));
    config.resolve.alias.set('ws', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@valor/nativescript-websockets'));
    config.resolve.alias.set(resolve(appRoot.path, './node_modules/unload/dist/es/browser.js'), resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/nativescript-rxdb/unload/browser.js'));
  });

  return webpack.resolveConfig();
};

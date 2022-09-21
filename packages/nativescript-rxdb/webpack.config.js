const webpack = require('@nativescript/webpack');
const { resolve } = require('path');
const appRoot = require('app-root-path');

module.exports = (wp) => {
  console.log('PLEASE FOR THE LOVE OF GOD WORK!!!');

  wp.chainWebpack((config) => {
    const nodeModulesPath = webpack.Utils.project.getProjectFilePath('node_modules');
    config.resolve.alias.set('pouchdb-md5', resolve(nodeModulesPath, '@herefishyfish/rxdb/pouchdb'));
    config.resolve.alias.set('uuid', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/rxdb/uuid'));
    config.resolve.alias.set('isomorphic-fetch', resolve(nodeModulesPath, '@nativescript/core'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set(resolve(appRoot.path, './node_modules/unload/dist/es/browser.js'), resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/rxdb/unload/browser.js'));
  });
};
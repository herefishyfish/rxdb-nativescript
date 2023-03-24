const { resolve } = require('path');
const appRoot = require('app-root-path');
const { ProvidePlugin, NormalModuleReplacementPlugin } = require('webpack');

module.exports = (webpack) => {
  webpack.chainWebpack((config) => {
    const nodeModulesPath = webpack.Utils.project.getProjectFilePath('node_modules');

    config.plugin('ProvidePlugin|Polyfills').use(ProvidePlugin, [
      {
        Buffer: [require.resolve('buffer/'), 'Buffer'],
      },
    ]);

    // Fix and patch imports
    config.resolve.alias.set('ws', resolve(nodeModulesPath, '@valor/nativescript-websockets'));
    config.resolve.alias.set('pouchdb-md5', resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/pouchdb'));
    config.resolve.alias.set('uuid', resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/uuid'));
    // config.resolve.alias.set('isomorphic-ws', resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/isomorphic-ws'));
    config.resolve.alias.set('isomorphic-ws', resolve(appRoot.path, './node_modules/isomorphic-ws/browser.js'));
    config.resolve.alias.set('isomorphic-fetch', resolve(nodeModulesPath, '@nativescript/core'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set(resolve(appRoot.path, './node_modules/unload/dist/es/browser.js'), resolve(nodeModulesPath, '@herefishyfish/nativescript-rxdb/unload/browser.js'));
  });
};

const webpack = require('@nativescript/webpack');
const { resolve } = require('path');
const appRoot = require('app-root-path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('angular');

  webpack.chainWebpack((config, env) => {
    // shared demo code
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));

    console.log(webpack.Utils.project.getProjectFilePath('node_modules'));
    config.resolve.alias.set('pouchdb-md5', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@herefishyfish/rxdb/pouchdb'));
    config.resolve.alias.set('broadcast-channel', resolve(appRoot.path, './node_modules/broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set('isomorphic-fetch', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@nativescript/core'));
    config.resolve.alias.set('ws', resolve(webpack.Utils.project.getProjectFilePath('node_modules'), '@valor/nativescript-websockets'));
  });

  // Example if you need to share images across demo apps:
  // webpack.Utils.addCopyRule({
  //   from: '../../../tools/images',
  // 	to: 'images',
  //   context: webpack.Utils.project.getProjectFilePath('node_modules')
  // });

  return webpack.resolveConfig();
};

const webpack = require('@nativescript/webpack');
const { resolve } = require('path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('angular');

  webpack.chainWebpack((config, env) => {
    // shared demo code
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));
    config.resolve.alias.set('@herefishyfish/requery-sqlite', resolve(__dirname, 'node_modules', '@herefishyfish', 'requery-sqlite'));
  });

  return webpack.resolveConfig();
};

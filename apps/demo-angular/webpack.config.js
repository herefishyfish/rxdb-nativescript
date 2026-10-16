const webpack = require('@nativescript/webpack');
const { resolve } = require('path');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('angular');

  webpack.chainWebpack((config) => {
    // shared demo code
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));

    // NativeScript's Android V8 has no ICU property data, so /\p{...}/u won't compile.
    config.module
      .rule('unicode-property-regex')
      .test(/[\\/]node_modules[\\/]fast-uri[\\/].*\.js$/)
      .use('babel-loader')
      .loader('babel-loader')
      .options({ babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-unicode-property-regex'] });
  });

  return webpack.resolveConfig();
};

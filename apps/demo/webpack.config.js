const webpack = require('@nativescript/webpack');
const { join, resolve } = require('path');
const { merge } = require('webpack-merge');
const { ProvidePlugin } = require('webpack');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('typescript');

  webpack.chainWebpack((config) => {
    config.resolve.alias.set('@demo/shared', resolve(__dirname, '..', '..', 'tools', 'demo'));

    const fallback = config.resolve.get('fallback');
    config.resolve.set(
      'fallback',
      webpack.Utils.merge(fallback || {}, {
        timers: require.resolve('@nativescript/core/'),
        fs: require.resolve('@nativescript/core/'),
        module: require.resolve('@nativescript/core/'),
        path: require.resolve('@nativescript/core/'),
        assert: require.resolve('browser-assert'),
        buffer: require.resolve('buffer/'),
        events: require.resolve('events/'),
        process: require.resolve('process/browser'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
        zlib: false,
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        vm: require.resolve('vm-browserify'),
      })
    );

    config.plugin('ProvidePlugin|Polyfills').use(ProvidePlugin, [
      {
        Buffer: [require.resolve('buffer/'), 'Buffer'],
        crypto: [require.resolve('crypto-browserify/'), 'crypto'],
      },
    ]);

    config.plugin('DefinePlugin').tap((args) => {
      Object.assign(args[0], {
        // process: "global.process",
        'process.platform': JSON.stringify('nativescript'),
        'process.env': 'global',
        'process.env.NODE_DEBUG': false,
        'process.version': JSON.stringify('0.0.0'),
        'process.browser': true,
      });

      return args;
    });
  });

  return webpack.resolveConfig();
};

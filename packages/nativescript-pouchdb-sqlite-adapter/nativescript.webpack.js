const { resolve } = require('path');
const appRoot = require('app-root-path');
const { ProvidePlugin, NormalModuleReplacementPlugin } = require('webpack');

module.exports = (webpack) => {
  webpack.chainWebpack((config) => {
    // Fix and patch imports
    const fallback = config.resolve.get('fallback');
    config.resolve.set(
      'fallback',
      webpack.Utils.merge(fallback || {}, {
        timers: require.resolve('@nativescript/core/'),
        module: require.resolve('@nativescript/core/'),
        path: require.resolve('path-browserify'),
        assert: require.resolve('browser-assert'),
        buffer: require.resolve('buffer/'),
        events: require.resolve('events/'),
        // tty: require.resolve("tty-browserify"),
        process: require.resolve('process/browser'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        // url: require.resolve('url/'),
        // BroadcastChannel: false,
        crypto: require.resolve('crypto-browserify'),
        // // crypto: require.resolve('../libs/crypto/crypto-browserify.js'),
        zlib: false,
        // zlib: require.resolve('browserify-zlib'),
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
        process: 'global.process',
        'process.platform': JSON.stringify('nativescript'),
        'process.env': 'global',
        'process.env.NODE_DEBUG': false,
        'process.version': JSON.stringify('0.0.0'),
        'process.browser': true,
      });

      return args;
    });
  });
};

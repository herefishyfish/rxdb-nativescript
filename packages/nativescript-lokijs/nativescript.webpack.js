module.exports = (webpack) => {
  webpack.chainWebpack((config) => {
    const fallback = config.resolve.get('fallback');
    config.resolve.set(
      'fallback',
      webpack.Utils.merge(fallback || {}, {
        fs: require.resolve('@nativescript/core'),
      })
    );
  });
};

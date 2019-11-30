// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    mode: 'production',
    optimization: {
      usedExports: true
    },
    // plugins: [
    //   new BundleAnalyzerPlugin({ analyzerPort: 8787 })
    // ],
    externals: {
      lodash: 'lodash',
      vuex: 'vuex'
    }
  }
}


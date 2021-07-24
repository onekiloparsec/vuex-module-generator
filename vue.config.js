// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    config.mode = 'production'
    config.optimization = {
      usedExports: true
    }
    // plugins: [
    //   new BundleAnalyzerPlugin({ analyzerPort: 8787 })
    // ],
    config.externals = {
      vuex: 'vuex'
    }
  }
}

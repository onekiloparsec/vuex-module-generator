// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    config.mode = 'production'
    config.optimization = { usedExports: true }
    config.externals = { vuex: 'vuex' }
    config.module.rule(/\.tsx?$/).use('ts-loader')
    config.module.rule(/\.js$/).use('source-map-loader')
    // plugins: [
    //   new BundleAnalyzerPlugin({ analyzerPort: 8787 })
    // ],
  }
}

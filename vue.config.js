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
      vuex: 'vuex'
    }
    config.module = {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
        { test: /\.js$/, loader: 'source-map-loader' },
        { test: /\.vue$/, loader: 'vue-loader' }
      ]
    }
  }
}

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    externals: {
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        root: 'lodash'
      },
      vuex: {
        commonjs: 'vuex',
        commonjs2: 'vuex',
        root: 'vuex'
      }
    }
  }
}

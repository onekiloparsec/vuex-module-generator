const path = require('path')
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '/src') }
    ]
  },
  test: {},
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VuexModuleGenerator',
      fileName: (format) => `vuex-module-generator.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'vuex'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          vuex: 'Vuex'
        }
      }
    }
  }
})

# VuexArcsecondModuleGenerator

[![npm](https://img.shields.io/npm/v/vuex-arcsecond-module-generator.svg)](https://www.npmjs.com/package/vuex-arcsecond-module-generator) [![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

> A Vuex Plugin

## Installation

```bash
npm install --save vuex-arcsecond-module-generator
```

## Usage

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'
import VuexArcsecondModuleGenerator from 'vuex-arcsecond-module-generator'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'vuex-arcsecond-module-generator/dist/vuex-arcsecond-module-generator.css'

Vue.use(VuexArcsecondModuleGenerator)
```

### Browser

```html
<!-- Include after Vue -->
<!-- Local files -->
<link rel="stylesheet" href="vuex-arcsecond-module-generator/dist/vuex-arcsecond-module-generator.css"></link>
<script src="vuex-arcsecond-module-generator/dist/vuex-arcsecond-module-generator.js"></script>

<!-- From CDN -->
<link rel="stylesheet" href="https://unpkg.com/vuex-arcsecond-module-generator/dist/vuex-arcsecond-module-generator.css"></link>
<script src="https://unpkg.com/vuex-arcsecond-module-generator"></script>
```

## Development

### Launch visual tests

```bash
npm run dev
```

### Launch Karma with coverage

```bash
npm run dev:coverage
```

### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## Publishing

The `prepublish` hook will ensure dist files are created before publishing. This
way you don't need to commit them in your repository.

```bash
# Bump the version first
# It'll also commit it and create a tag
npm version
# Push the bumped package and tags
git push --follow-tags
# Ship it 🚀
npm publish
```

## License

[MIT](http://opensource.org/licenses/MIT)

# vuex-module-generator

Generate a full-featured Vuex module linked to a REST endpoint. Made for an SPA using more than 50+ endpoints.

## Usage

With this:

```js
const satellites = makeStoreModule()
```

You get this:

```js

```

## Base Use Case

Say, you have an Vue.js Single-Page Application (SPA) for the browser, that is heavily relying on a pure RESTful backend,...

Say, you choose to develop your large SPA with Vuex, the Vue.js module of Redux principles...

Say, you need to easily retrieve and store list of items, possibly paged, and supporting search query parameters...

Say, you need to also fetch details of items, and easily managed the introduction in your module of new items, update of items, deletion of items...

Say, you regularly need to also handle the selection of an item in a list, or even the selection of multiple items of that list...

Of course, for all these actions you need to correctly handle the request failures, the succeses and the famous loading status to display that little spinning wheel...

## Advanced Use Case

(subresources + data attaching)


## Developers

### Setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```


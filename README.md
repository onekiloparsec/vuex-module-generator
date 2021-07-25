![build](https://img.shields.io/github/workflow/status/onekiloparsec/vuex-module-generator/Node%20CI/master)
![npm bundle min size](https://img.shields.io/bundlephobia/minzip/vuex-module-generator)
![licence](https://img.shields.io/github/license/onekiloparsec/vuex-module-generator)
![version](https://img.shields.io/github/package-json/v/onekiloparsec/vuex-module-generator)

# vuex-module-generator

Generate a full-featured [Vuex 3](https://vuex.vuejs.org) module linked to a REST endpoint. Especially useful for large
Single-Page Applications using more than 50+ endpoints and choosing Vuex as state management.

This lib has no dependencies apart from vuex.

## Basic Usage

### Intro

With this:

```js
import axios from 'axios'

const satellites = makeStoreModule('satellite', 'norad_catalog_number')
  .generateActions(axios, 'https://api.arcsecond.io/', 'lcrusd')
```

(Note that `norad_catalog_number` is simply the name of the id property returned by the backend. It simply shows that
you can put anything: `pk`, `id`
, `dummy`, whatever.)

...you get a **namespaced vuex store module** with...

### State

...this state (automatically updated and managed):

* a `satellites` array (initial = `[]`)
* a `satellitesLoadingStatus` object for each activated LCRUSD action (see below): (initial
  = `{ list: false, create: false, read: null, update: null, swap: null, delete: null }`)
* a `selectedSatellite` property (initial = `null`) to hold a single selection
* a `lastSatellitesError` property (initial = `null`) to hold the last action error.

### Getters

... this getter:

* a `getSatellite(norad_catalog_number)`

### Mutations

...these fetch / LCRUSD mutations (automatically handled by the module):

* `[list|create|read|update|swap|delete]SatellitePending`
* `[list|create|read|update|swap|delete]SatelliteSuccess`
* `[list|create|read|update|swap|delete]SatelliteFailure`

which correspondingly updates the `satelliteLoadingStatus` object property (with a boolean for `list` and `create`
and the object id for the other actions.)

...but also this mutation:

* `selectSatellite(<satelliteObject>)`

### Actions

...these actions, which **both update the store module and return the request body** (making the use of them very
flexible):

* a `listSatellites()` (which can receive search parameters like this: `listSatellites({key1: value1, key2: value2}`)
* a `createSatellite(payload)` with a `payload` object
* a `readSatellite(norad_catalog_number)` with the `norad_catalog_number` which is the name of the id for htis endpoint.
* a `updateSatellite({norad_catalog_number: <value>, data: <data object>})`
* a `swapSatellite({norad_catalog_number: <value>, data: <data object>})`
* a `delete(norad_catalog_number)` with the `norad_catalog_number` which is the name of the id for htis endpoint.

## LCRUSD ?

It is a simple way to distinguish actions made on a RESTful backend, because names based on a HTTP verbs, or the usual
`CRUD` acronym aren't sophisticated enough. For instance, a `POST` request to a `list` endpoint creates an object, while
a `GET` fetches the list of all these objects. It is more readable, at the functional app code level, to distinguish
them.

Hence, quite logically:

* `l` means **list** and performs a `GET` request on the `list` endpoint
* `c` means **create** and performs a `POST` request on the `list` endpoint
* `r` means **read** and performs a `GET` request on the `detail` endpoint
* `u` means **update** and peforms a `PATCH` request (= partial update) on the `detail` endpoint
* `s` means **swap** and performs a `PUT` request (= full update) on the `detail` endpoint
* `d` means **delete** and performs a `DELETE` request on the `detail` endpoint

## Typical workflow

In a Vue.js component, you can have a table displaying the `satellites` array. At the beginning it is empty, but you
trigger a `listSatellites` action, during which the `satellitesLoadingStatus.list` is `true`. Once successful
the `satellites` array is filled with the request response, while the loading status is back to `false`. Clicking on a
row of the table triggers `selectSatellite` which allow other Vue components to see a non-null
`selectedSatellite`.

## Items Data Management

* If a read is successful, it will update the list and **replace** the object inside it if it is present. If not, it
  will be appended to the list.
* If an update is successful, it will update the list and **update** the object inside it if it is present. If not, it
  will be appended to the list.
* If an swap is successful, it will update the list and **replace** the object inside it if it is present. If not, it
  will be appended to the list.
* If a delete is successful, it will update the list and **remove** the object inside it if it is present.

Of course, the `selection` state is always updated accordingly.

Moreover, If an action is called on an unknown item, it does nothing silently.

## Advanced Usage

In fact, you get a lot more with this lib. But make sure to read what's above first, and let flow it inside your head.

Then...

## Base Use Case

*(Just a way to explain why the above.)*

**Say**, you have an Vue.js (v2) Single-Page Application (SPA) for the browser, that is heavily relying on a pure
RESTful backend,...

**Say**, you choose to develop your large SPA with Vuex, the Vue.js module with Redux principles, as a state management
library...

**Say**, you need to easily retrieve and store list of items, possibly paged, and supporting search query parameters...

**Say**, you need to also fetch details of items, and easily managed the introduction in your module of new items,
update of items, deletion of items...

**Say**, you regularly need to also handle the selection of an item in a list, or even the selection of multiple items
of that list...

**Say**, you need this a dozen times, maybe a dozen dozen dozen times... all the same basic way...

**Say**, of course, that for all these actions, you need to correctly handle the request failures, the succeses and the
famous loading status to display that little spinning wheel...

## Advanced Use Case

(subresources + data attaching)

## Developers

### Setup

```
npm install
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


import { makeModule } from '@/index'
import { createModuleNames } from '@/utils'

import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'

Vue.use(Vuex)
Vue.use(VueResource)

console.log(createModuleNames('items'))

const API_URL = 'http://localhost:8080/'
const mutationNames = createModuleNames('items').mutations

let listStore = null
let treeStore = null
let stores = []

const mock1 = { name: 'dummy1', id: 1 }
const mock2 = { name: 'dummy2', id: 2 }
const readMock2 = { name: 'dummy2 full', id: 2 }
const mock3 = { name: 'dummy3', id: 3 }

const newMock1 = { name: 'new dummy1', id: 1 }
const newMock2 = { name: 'new dummy2', id: 2 }
const newMock3 = { name: 'new dummy3', id: 3 }

// ----------------------------------------------------------------------------------------

describe('test actions after successes without selection and WITHOUT list', () => {
  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: false
        })
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: true
        })
      },
      strict: true
    })
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('success read actions on state without list', () => {
    for (const store of stores) {
      expect(store.state.items.items).toEqual([])
      store.commit('items/' + mutationNames['read'] + 'Success', mock2)
      expect(store.state.items.items).toEqual([mock2])
    }
  })

  test('success update actions on state without list', () => {
    for (const store of stores) {
      expect(store.state.items.items).toEqual([])
      store.commit('items/' + mutationNames['read'] + 'Success', mock2)
      store.commit('items/' + mutationNames['update'] + 'Success', readMock2)
      expect(store.state.items.items).toEqual([readMock2])
    }
  })

  test('success delete actions on state after list', () => {
    for (const store of stores) {
      expect(store.state.items.items).toEqual([])
      store.commit('items/' + mutationNames['read'] + 'Success', mock2)
      expect(store.state.items.items).toEqual([mock2])
      store.commit('items/' + mutationNames['delete'] + 'Success', 2)
      expect(store.state.items.items).toEqual([])
    }
  })

  test('success read then list', () => {
    for (const store of stores) {
      expect(store.state.items.items).toEqual([])
      store.commit('items/' + mutationNames['read'] + 'Success', readMock2)
      expect(store.state.items.items).toEqual([readMock2])
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
    }
  })
})

// ----------------------------------------------------------------------------------------

describe('test actions after LIST successes without selection', () => {
  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: false
        })
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: true
        })
      },
      strict: true
    })
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
    }
  })

  test('success read actions on state after list', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['read'] + 'Success', readMock2)
      expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
    }
  })

  test('success update actions on state after list', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['update'] + 'Success', readMock2)
      expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
    }
  })

  test('success delete actions on state after list', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['delete'] + 'Success', 2)
      expect(store.state.items.items).toEqual([mock1, mock3])
    }
  })
})

// ----------------------------------------------------------------------------------------

describe('test actions successes WITH selection MULTIPLE = True', () => {
  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: false
        })
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: true
        })
      },
      strict: true
    })
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      expect(store.state.items.selectedItems).toEqual([])
    }
  })

  test('success read&update actions on state and selection doesn\'t change', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
        store.commit('items/selectItem', mock1)
        expect(store.state.items.selectedItems).toEqual([mock1])
        store.commit('items/' + mutationNames[actionName] + 'Success', readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([mock1])
      }
    }
  })

  test('success read&update actions on state and selection is also updated', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
        store.commit('items/selectItem', mock2)
        expect(store.state.items.selectedItems).toEqual([mock2])
        store.commit('items/' + mutationNames[actionName] + 'Success', readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([readMock2]) // selection updated with new object!
      }
    }
  })

  test('success delete actions on state and selection doesn\'t change', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1])
      expect(store.state.items.selectedItem).toEqual(null)
      store.commit('items/' + mutationNames['delete'] + 'Success', 3)
      expect(store.state.items.items).toEqual([mock1, mock2])
      expect(store.state.items.selectedItems).toEqual([mock1])
      expect(store.state.items.selectedItem).toEqual(null)
    }
  })

  test('success delete actions on state and selection doesn\'t change', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock1, mock2])
      expect(store.state.items.selectedItem).toEqual(null)
      store.commit('items/' + mutationNames['delete'] + 'Success', 3)
      expect(store.state.items.items).toEqual([mock1, mock2])
      expect(store.state.items.selectedItems).toEqual([mock1, mock2])
      expect(store.state.items.selectedItem).toEqual(null)
    }
  })

  test('success delete actions on state and selection change', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock3)
      expect(store.state.items.selectedItems).toEqual([mock1, mock3])
      expect(store.state.items.selectedItem).toEqual(null)
      store.commit('items/' + mutationNames['delete'] + 'Success', 3)
      expect(store.state.items.items).toEqual([mock1, mock2])
      expect(store.state.items.selectedItems).toEqual([mock1])
      expect(store.state.items.selectedItem).toEqual(null)
    }
  })

  test('success delete actions on state and selection is also updated', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock2])
      store.commit('items/' + mutationNames['delete'] + 'Success', 2)
      expect(store.state.items.items).toEqual([mock1, mock3])
      expect(store.state.items.selectedItems).toEqual([]) // selection updated!
    }
  })
})

// ----------------------------------------------------------------------------------------

describe('test actions successes WITH selection and update of list', () => {
  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: false
        })
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: true,
          allowTree: true
        })
      },
      strict: true
    })
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock2)
      store.commit('items/' + mutationNames['list'] + 'Success', [newMock1, newMock2, newMock3])
      expect(store.state.items.selectedItems).toEqual([])
    }
  })
})

// ----------------------------------------------------------------------------------------

describe('test actions successes WITH selection MULTIPLE = False', () => {
  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: false,
          allowTree: false
        })
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeModule({
          http: Vue.http,
          apiURL: API_URL,
          apiPath: 'items/',
          root: 'item',
          idKey: 'id',
          lcrud: 'lcrud',
          allowMultipleSelection: false,
          allowTree: true
        })
      },
      strict: true
    })
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      expect(store.state.items.selectedItems).toEqual([])
    }
  })

  test('success read&update actions on state and selection doesn\'t change', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
        store.commit('items/selectItem', mock1)
        expect(store.state.items.selectedItems).toEqual([mock1])
        store.commit('items/' + mutationNames[actionName] + 'Success', readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([mock1])
      }
    }
  })

  test('success read&update actions on state and selection is also updated', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
        store.commit('items/selectItem', mock2)
        expect(store.state.items.selectedItems).toEqual([mock2])
        store.commit('items/' + mutationNames[actionName] + 'Success', readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([readMock2]) // selection updated with new object!
      }
    }
  })

  test('success delete actions on state and selection doesn\'t change', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1])
      expect(store.state.items.selectedItem).toEqual(mock1)
      store.commit('items/' + mutationNames['delete'] + 'Success', 3)
      expect(store.state.items.items).toEqual([mock1, mock2])
      expect(store.state.items.selectedItems).toEqual([mock1])
      expect(store.state.items.selectedItem).toEqual(mock1)
    }
  })

  test('success delete actions on state and selection is also updated', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'] + 'Success', [mock1, mock2, mock3])
      store.commit('items/selectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock2])
      store.commit('items/' + mutationNames['delete'] + 'Success', 2)
      expect(store.state.items.items).toEqual([mock1, mock3])
      expect(store.state.items.selectedItems).toEqual([]) // selection updated!
    }
  })
})

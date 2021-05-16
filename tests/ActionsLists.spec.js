import { makeModule } from '@'
import createModuleNames from '@/moduleNames'

import testAction from './ActionHelper'

import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'

Vue.use(Vuex)
Vue.use(VueResource)

const API_URL = 'http://localhost:8080/'
Vue.http.options.root = API_URL

const mock1 = { name: 'dummy1', id: 1 }
const mock2 = { name: 'dummy2', id: 2 }
const mock3 = { name: 'dummy3', id: 3 }

const routes = [
  {
    method: 'GET',
    url: 'items/',
    response: { body: [], status: 200 }
  },
  {
    method: 'GET',
    url: 'items/3/',
    response: { body: mock3, status: 200 }
  },
  {
    method: 'DELETE',
    url: 'items/2/',
    response: { body: null, status: 204 }
  }
]

Vue.http.interceptors.unshift((request, next) => {
  const route = routes.find((item) => {
    return (request.method === item.method && request.url === API_URL + item.url)
  })
  if (route) {
    next(request.respondWith(route.response.body, { status: route.response.status }))
  } else {
    next(request.respondWith({ status: 404, statusText: 'Oh no! Not found!' }))
  }
})

const mutationNames = createModuleNames('item').mutations

describe('test async api actions on module directly', () => {
  let itemsModule = null

  beforeEach(() => {
    itemsModule = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'id',
      lcrusd: 'lcrusd',
      allowMultipleSelection: false,
      allowTree: false
    })
  })

  afterEach(() => {
    itemsModule = null
  })

  test('the list is empty at start', done => {
    testAction(itemsModule.actions.listItems, null, {}, [
      { type: mutationNames.crud['list'] + 'Pending' },
      { type: mutationNames.crud['list'] + 'Success', payload: [] }
    ], done)
  })

  test('reading an item', done => {
    testAction(itemsModule.actions.readItem, 3, {}, [
      { type: mutationNames.crud['read'] + 'Pending', payload: 3 },
      { type: mutationNames.crud['read'] + 'Success', payload: mock3 }
    ], done)
  })

  test('removal of an item in list after delete', done => {
    itemsModule.state.items = [mock1, mock2, mock3]
    testAction(itemsModule.actions.deleteItem, 2, itemsModule.state, [
      { type: mutationNames.crud['delete'] + 'Pending', payload: 2 },
      { type: mutationNames.crud['delete'] + 'Success', payload: 2 }
    ], done)
  })
})

// Tests at the mutations level

describe('test async list & read api mutations inside a valid store', () => {
  let store
  let mutations

  beforeEach(() => {
    let itemsModule = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'id',
      lcrusd: 'lcrusd',
      allowMultipleSelection: false,
      allowTree: false
    })

    mutations = {
      ...itemsModule.mutations,
      listItemsPending: jest.fn(),
      listItemsSuccess: jest.fn(),
      readItemPending: jest.fn(),
      readItemSuccess: jest.fn(),
      deleteItemPending: jest.fn(),
      deleteItemSuccess: jest.fn()
    }

    store = new Vuex.Store({ modules: { items: { ...itemsModule, mutations: mutations } } })
  })

  afterEach(() => {
    store = null
  })

  test('listing items with no data', async done => {
    await store.dispatch('items/listItems')
    expect(mutations.listItemsPending).toHaveBeenCalledWith(expect.any(Object), undefined)
    expect(mutations.listItemsSuccess).toHaveBeenCalledWith(expect.any(Object), [])
    done()
  })

  test('reading an item', async done => {
    await store.dispatch('items/readItem', 3)
    expect(mutations.readItemPending).toHaveBeenCalledWith(expect.any(Object), 3)
    expect(mutations.readItemSuccess).toHaveBeenCalledWith(expect.any(Object), mock3)
    done()
  })

  test('deleting an item', async done => {
    // Check at top of file for mocked requests
    await store.dispatch('items/deleteItem', 2)
    expect(mutations.deleteItemPending).toHaveBeenCalledWith(expect.any(Object), 2)
    expect(mutations.deleteItemSuccess).toHaveBeenCalledWith(expect.any(Object), 2)
    done()
  })
})

// Tests at the store level

describe('test async update actions inside a valid store', () => {
  let store

  beforeEach(() => {
    let itemsModule = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'id',
      lcrusd: 'lcrusd',
      allowMultipleSelection: false,
      allowTree: false
    })

    store = new Vuex.Store({ modules: { items: itemsModule } })
  })

  afterEach(() => {
    store = null
  })

  test('deleting an item', async done => {
    // Check at top of file for mocked requests
    await store.commit('items/updateItemsList', [mock1, mock2, mock3])
    expect(store.state.items.items).toEqual([mock1, mock2, mock3])
    await store.dispatch('items/deleteItem', 2)
    expect(store.state.items.items).toEqual([mock1, mock3])
    done()
  })
})

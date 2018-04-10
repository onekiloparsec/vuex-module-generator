import { makeModule } from '@/index'
import { createMutationNames } from '@/utils'

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

const mutationNames = createMutationNames('ITEMS')

describe('test async api actions on module directly', () => {
  let itemsModule = null

  beforeEach(() => {
    itemsModule = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lcrud',
      allowMultipleSelection: false,
      allowTree: false
    })
  })

  afterEach(() => {
    itemsModule = null
  })

  test('the list is empty at start', done => {
    testAction(itemsModule.actions.listItems, null, {}, [
      { type: mutationNames['list'].PENDING },
      { type: mutationNames['list'].SUCCESS, payload: [] }
    ], done)
  })

  test('reading an item', done => {
    testAction(itemsModule.actions.readItem, 3, {}, [
      { type: mutationNames['read'].PENDING, payload: 3 },
      { type: mutationNames['read'].SUCCESS, payload: mock3 }
    ], done)
  })

  test('removal of an item in list after delete', done => {
    itemsModule.state.items = [mock1, mock2, mock3]
    testAction(itemsModule.actions.deleteItem, 2, itemsModule.state, [
      { type: mutationNames['delete'].PENDING, payload: 2 },
      { type: mutationNames['delete'].SUCCESS, payload: 2 }
    ], done)
  })
})


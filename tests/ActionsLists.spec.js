import { makeModule } from '@/index'
import { createModuleNames } from '@/utils'

import testAction from './ActionHelper'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// const API_URL = 'http://localhost:8080/'
// http.options.root = API_URL

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

// http.interceptors.unshift((request, next) => {
//   const route = routes.find((item) => {
//     return (request.method === item.method && request.url === API_URL + item.url)
//   })
//   if (route) {
//     next(request.respondWith(route.response.body, { status: route.response.status }))
//   } else {
//     next(request.respondWith({ status: 404, statusText: 'Oh no! Not found!' }))
//   }
// })

const mutationNames = createModuleNames('items').mutations

describe('test async api actions on module directly', () => {
  let itemsModule = null

  beforeEach(() => {
    itemsModule = makeModule({
      http: http,
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
      { type: mutationNames['list'] + 'Pending' },
      { type: mutationNames['list'] + 'Success', payload: [] }
    ], done)
  })

  test('reading an item', done => {
    testAction(itemsModule.actions.readItem, 3, {}, [
      { type: mutationNames['read'] + 'Pending', payload: 3 },
      { type: mutationNames['read'] + 'Success', payload: mock3 }
    ], done)
  })

  test('removal of an item in list after delete', done => {
    itemsModule.state.items = [mock1, mock2, mock3]
    testAction(itemsModule.actions.deleteItem, 2, itemsModule.state, [
      { type: mutationNames['delete'] + 'Pending', payload: 2 },
      { type: mutationNames['delete'] + 'Success', payload: 2 }
    ], done)
  })
})

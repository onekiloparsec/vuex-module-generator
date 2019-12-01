import { makeModule } from '@/index'
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
const mock4 = { name: 'dummy4', id: 4 }
const mock5 = { name: 'dummy5', id: 5 }
const mock6 = { name: 'dummy6', id: 6 }
const mock7 = { name: 'dummy7', id: 7 }

const routes = [
  {
    method: 'GET',
    url: 'items/?page=1',
    response: { body: { results: [mock1, mock2, mock3, mock4], count: 7, previous: null, next: API_URL + 'items/?page=2' }, status: 200 }
  },
  {
    method: 'GET',
    url: 'items/?page=2',
    response: { body: { results: [mock5, mock6, mock7], count: 7, previous: API_URL + 'items/?page=1', next: null }, status: 200 }
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
      idKey: 'uuid',
      lcrud: 'pcrud', // NOTE THE P!!! (instead of the l)
      allowMultipleSelection: false,
      allowTree: false
    })
  })

  afterEach(() => {
    itemsModule = null
  })

  test('the list is fetched pages by pages, unti the end.', done => {
    testAction(itemsModule.actions.listItems, null, {}, [
      { type: mutationNames.crud['list'] + 'Pending' },
      { type: mutationNames.crud['list'] + 'PartialSuccess', payload: { page: 1, total: 2, payload: [mock1, mock2, mock3, mock4] } },
      { type: mutationNames.crud['list'] + 'PartialSuccess', payload: { page: 2, total: 2, payload: [mock5, mock6, mock7] } },
      { type: mutationNames.crud['list'] + 'Success', payload: [mock1, mock2, mock3, mock4, mock5, mock6, mock7] }
    ], done)
  })
})

describe('test async api actions inside a valid store', () => {
  let store
  let mutations

  beforeEach(() => {
    const itemsModule = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'pcrud', // NOTE THE P!!! (instead of the l)
      allowMultipleSelection: false,
      allowTree: false
    })

    mutations = {
      listItemsPending: jest.fn(),
      listItemsPartialSuccess: jest.fn(),
      listItemsSuccess: jest.fn()
    }

    store = new Vuex.Store({ modules: { items: { ...itemsModule, mutations: mutations } } })
  })

  afterEach(() => {
    store = null
  })

  test('the list is fetched pages by pages, until the end.', async done => {
    await store.dispatch('items/listItems')
    expect(mutations.listItemsPending).toHaveBeenCalledWith(expect.any(Object), undefined)
    expect(mutations.listItemsPartialSuccess).toHaveBeenCalledWith(expect.any(Object), { page: 1, total: 2, payload: [mock1, mock2, mock3, mock4] })
    expect(mutations.listItemsPartialSuccess).toHaveBeenCalledWith(expect.any(Object), { page: 2, total: 2, payload: [mock5, mock6, mock7] })
    expect(mutations.listItemsSuccess).toHaveBeenCalledWith(expect.any(Object), [mock1, mock2, mock3, mock4, mock5, mock6, mock7])
    done()
  })
})

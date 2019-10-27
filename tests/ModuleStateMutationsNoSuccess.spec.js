import { makeModule } from '@/index'
import { createModuleNames } from '@/utils'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const http = {
  get: jest.fn(),
  options: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

const API_URL = 'http://localhost:8080/'
const mutationNames = createModuleNames('item').mutations
const objActionNames = ['read', 'update', 'delete']
const boolActionNames = ['list', 'create']

let listStore = null
let treeStore = null
let stores = []

beforeEach(() => {
  listStore = new Vuex.Store({
    modules: {
      items: makeModule({
        http: http,
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
        http: http,
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

describe('test boolean actions', () => {
  test('failure crud state for bool actions', () => {
    for (const store of stores) {
      for (const actionName of boolActionNames) {
        const mutNames = mutationNames[actionName]
        expect(store.state.items.itemCrud[actionName]).toEqual(false)
        store.commit('items/' + mutNames + 'Pending')
        expect(store.state.items.itemCrud[actionName]).toEqual(true)
        store.commit('items/' + mutNames + 'Failure')
        expect(store.state.items.itemCrud[actionName]).toEqual(false)
      }
    }
  })
})

describe('test object actions', () => {
  const mock = { name: 'fake news', uuid: '123456-789090' }

  // We do NOT test success in this spec.js file, since it is the key point where
  // list and tree modules differ.

  test('failure crud state for obj actions', () => {
    for (const store of stores) {
      for (const actionName of objActionNames) {
        const mutNames = mutationNames[actionName]
        expect(store.state.items.itemCrud[actionName]).toEqual(null)
        store.commit('items/' + mutNames + 'Pending', mock)
        expect(store.state.items.itemCrud[actionName]).toEqual(mock)
        store.commit('items/' + mutNames + 'Failure')
        expect(store.state.items.itemCrud[actionName]).toEqual(null)
      }
    }
  })
})

import { makeListModule, makeTreeModule } from '@/index'
import { createMutationNames } from '@/utils'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const API_URL = 'http://localhost:8080/'
const mutationNames = createMutationNames('ITEMS')

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

beforeEach(() => {
  listStore = new Vuex.Store({
    modules: {
      items: makeListModule(API_URL, 'items/', 'item', 'id', true, 'lcrud')
    },
    strict: false
  })
  treeStore = new Vuex.Store({
    modules: {
      items: makeTreeModule(API_URL, 'items/', 'item', 'id', true, 'lcrud')
    },
    strict: false
  })
  stores = [listStore, treeStore]
})

afterEach(() => {
  stores = []
  listStore = null
  treeStore = null
})

describe('test actions successes without selection', () => {
  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
    }
  })

  test('success read actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['read'].SUCCESS, readMock2)
      expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
    }
  })

  test('success update actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['update'].SUCCESS, readMock2)
      expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
    }
  })

  test('success delete actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      store.commit('items/' + mutationNames['delete'].SUCCESS, 2)
      expect(store.state.items.items).toEqual([mock1, mock3])
    }
  })
})

describe('test actions successes WITH selection', () => {
  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      expect(store.state.items.items).toEqual([mock1, mock2, mock3])
      expect(store.state.items.selectedItems).toEqual([])
    }
  })

  test('success read&update actions on state and selection doesn\'t change', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
        store.commit('items/selectItem', mock1)
        expect(store.state.items.selectedItems).toEqual([mock1])
        store.commit('items/' + mutationNames[actionName].SUCCESS, readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([mock1])
      }
    }
  })

  test('success read&update actions on state and selection is also updated', () => {
    for (const actionName of ['read', 'update']) {
      for (const store of stores) {
        store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
        store.commit('items/selectItem', mock2)
        expect(store.state.items.selectedItems).toEqual([mock2])
        store.commit('items/' + mutationNames[actionName].SUCCESS, readMock2)
        expect(store.state.items.items).toEqual([mock1, readMock2, mock3])
        expect(store.state.items.selectedItems).toEqual([readMock2]) // selection updated with new object!
      }
    }
  })

  test('success delete actions on state and selection doesn\'t change', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1])
      store.commit('items/' + mutationNames['delete'].SUCCESS, 3)
      expect(store.state.items.items).toEqual([mock1, mock2])
      expect(store.state.items.selectedItems).toEqual([mock1])
    }
  })

  test('success delete actions on state and selection is also updated', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      store.commit('items/selectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock2])
      store.commit('items/' + mutationNames['delete'].SUCCESS, 2)
      expect(store.state.items.items).toEqual([mock1, mock3])
      expect(store.state.items.selectedItems).toEqual([]) // selection updated!
    }
  })
})

describe('test actions successes WITH selection and update of list', () => {
  test('success list actions on state', () => {
    for (const store of stores) {
      store.commit('items/' + mutationNames['list'].SUCCESS, [mock1, mock2, mock3])
      store.commit('items/selectItem', mock2)
      store.commit('items/' + mutationNames['list'].SUCCESS, [newMock1, newMock2, newMock3])
      expect(store.state.items.selectedItems).toEqual([])
    }
  })
})

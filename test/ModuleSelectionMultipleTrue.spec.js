import { makeListModule, makeTreeModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const mock1 = { name: 'dummy1' }
const mock2 = { name: 'dummy2' }
const mock3 = { name: 'dummy3' }

describe('test selection of items Multiple = True', () => {
  let listStore = null
  let treeStore = null
  let stores = []

  beforeEach(() => {
    listStore = new Vuex.Store({
      modules: {
        items: makeListModule(null, 'item', 'uuid', 'lcrud')
      },
      strict: true
    })
    treeStore = new Vuex.Store({
      modules: {
        items: makeTreeModule(null, 'item', 'uuid', 'lcrud')
      },
      strict: true
    })
    listStore.commit('items/enableMultipleItemsSelection')
    treeStore.commit('items/enableMultipleItemsSelection')
    stores = [listStore, treeStore]
  })

  afterEach(() => {
    stores = []
    listStore = null
    treeStore = null
  })

  test('Selection starting empty', () => {
    for (const store of stores) {
      expect(store.state.items.selectedItems).toEqual([])
    }
  })

  test('Selection with valid item', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
    }
  })

  test('Selection with multiple valid items', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock3)
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
      store.commit('items/selectItem', mock3)
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
      store.commit('items/selectItem', mock2)
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(true)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
    }
  })

  test('Selection with unknown item', () => {
    // object is nonetheless selected even if it is not part of the list !
    // this should certainly change, but it is tricky to maintain selection inside a tree
    // when you use only an array to store selection
    const dummy = { name: 'toto' }
    for (const store of stores) {
      store.commit('items/selectItem', dummy)
      expect(store.getters['items/isSelected'](dummy)).toEqual(true)
      expect(store.getters['items/isSelected'](mock1)).toEqual(false)
    }
  })

  test('Selection multiple times the same item has effect only once', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1])
    }
  })

  test('Selection multiple times the same item has effect only once', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock2)
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1, mock2])
    }
  })

  test('Selection with null item has no effect', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItems).toEqual([mock1])
    }
  })

  test('Selection with undefined item has no effect', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', undefined)
      expect(store.state.items.selectedItems).toEqual([mock1])
    }
  })

  test('Deselection of an item', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock3)
      store.commit('items/selectItem', mock2)
      store.commit('items/selectItem', mock1)
      store.commit('items/deselectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock3, mock1])
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)

      // Deselecting again...
      store.commit('items/deselectItem', mock2)
      expect(store.state.items.selectedItems).toEqual([mock3, mock1])
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
    }
  })

  test('Deselection with undefined has no effect', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock3)
      store.commit('items/deselectItem', undefined)
      expect(store.state.items.selectedItems).toEqual([mock1, mock3])
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
    }
  })

  test('Deselection with null has no effect', () => {
    for (const store of stores) {
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock3)
      store.commit('items/deselectItem', null)
      expect(store.state.items.selectedItems).toEqual([mock1, mock3])
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
    }
  })

  test('Clear selection', () => {
    for (const store of stores) {
      expect(store.state.items.selectedItems).toEqual([])
      store.commit('items/clearItemsSelection')
      expect(store.state.items.selectedItems).toEqual([])
      store.commit('items/selectItem', mock1)
      expect(store.state.items.selectedItems).toEqual([mock1])
      store.commit('items/clearItemsSelection')
      expect(store.state.items.selectedItems).toEqual([])
      store.commit('items/selectItem', mock1)
      store.commit('items/selectItem', mock3)
      expect(store.state.items.selectedItems).toEqual([mock1, mock3])
      store.commit('items/clearItemsSelection')
      expect(store.state.items.selectedItems).toEqual([])
    }
  })

  test('Selection with single selection', () => {
    for (const store of stores) {
      store.commit('items/selectSingleItem', mock1)
      store.commit('items/selectSingleItem', mock3)
      expect(store.getters['items/isSelected'](mock1)).toEqual(false)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(true)
      store.commit('items/selectSingleItem', mock1)
      expect(store.getters['items/isSelected'](mock1)).toEqual(true)
      expect(store.getters['items/isSelected'](mock2)).toEqual(false)
      expect(store.getters['items/isSelected'](mock3)).toEqual(false)
    }
  })
})

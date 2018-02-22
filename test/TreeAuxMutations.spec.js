import { makeTreeModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const defaultCrud = { list: false, create: false, read: null, update: null, delete: null }
const mock1 = { name: 'dummy1' }
const mock2 = { name: 'dummy2' }
const mock3 = { name: 'dummy3' }
const mockItems = [mock1, mock2, mock3]

describe('test makeTreeModule directly', () => {
  let mod = null

  beforeEach(() => {
    mod = makeTreeModule(null, 'item', 'uuid', 'lcrud')
  })

  afterEach(() => {
    mod = null
  })

  test('Store module has correct state', () => {
    expect(mod.state.items).toEqual([])
    expect(mod.state.itemCrud).toEqual(defaultCrud)
    expect(mod.state.selectedItems).toEqual([])
  })

  test('module has correct auxiliary mutations', () => {
    expect(mod.mutations.selectItem).toBeDefined()
    expect(mod.mutations.deselectItem).toBeDefined()
    expect(mod.mutations.updateItemsList).toBeDefined()
  })
})

describe('test state and getters', () => {
  let store = null

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        items: makeTreeModule(null, 'item', 'uuid', 'lcrud')
      },
      strict: false
    })
  })

  afterEach(() => {
    store = null
  })

  test('Store module has correct namespaced state', () => {
    expect(store.state.items).toBeDefined()
    expect(store.state.items.items).toEqual([])
    expect(store.state.items.itemCrud).toEqual(defaultCrud)
    expect(store.state.items.selectedItems).toEqual([])
  })

  test('Selection with valid item', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.state.items.items = mockItems
    store.commit('items/selectItem', mock1)
    expect(store.getters['items/isSelected'](mock1)).toEqual(true)
    expect(store.getters['items/isSelected'](mock2)).toEqual(false)
  })

  test('Selection with invalid item', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.state.items.items = mockItems
    const dummy = { name: 'toto' }
    store.commit('items/selectItem', dummy)
    // object is nonetheless selected even if it is not part of the list !
    expect(store.getters['items/isSelected'](dummy)).toEqual(true)
  })

  test('Selection with null item has no effect', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.state.items.items = mockItems
    store.commit('items/selectItem', null)
    expect(store.state.items.selectedItems).toEqual([])
    store.commit('items/selectItem', undefined)
    expect(store.state.items.selectedItems).toEqual([])
  })

  test('Deselection works as expected', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.commit('items/selectItem', mock1)
    store.commit('items/selectItem', mock3)
    expect(store.getters['items/isSelected'](mock1)).toEqual(true)
    expect(store.getters['items/isSelected'](mock2)).toEqual(false)
    expect(store.getters['items/isSelected'](mock3)).toEqual(true)
    store.commit('items/deselectItem', mock1)
    expect(store.getters['items/isSelected'](mock1)).toEqual(false)
  })

  test('Deselection with null', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.commit('items/selectItem', mock1)
    store.commit('items/selectItem', mock3)
    store.commit('items/deselectItem', null)
    expect(store.state.items.selectedItems).toEqual([])
    expect(store.getters['items/isSelected'](mock1)).toEqual(false)
    expect(store.getters['items/isSelected'](mock2)).toEqual(false)
    expect(store.getters['items/isSelected'](mock3)).toEqual(false)
  })

  test('Deselection with undefined', () => {
    expect(store.state.items.selectedItems).toEqual([])
    store.commit('items/selectItem', mock1)
    store.commit('items/selectItem', mock3)
    store.commit('items/deselectItem', undefined)
    expect(store.state.items.selectedItems).toEqual([])
    expect(store.getters['items/isSelected'](mock1)).toEqual(false)
    expect(store.getters['items/isSelected'](mock2)).toEqual(false)
    expect(store.getters['items/isSelected'](mock3)).toEqual(false)
  })
})

import { makeListModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

let items = null
const defaultCrud = { list: false, create: false, read: null, update: null, delete: null }
const mock1 = { name: 'dummy1' }
const mock2 = { name: 'dummy2' }
const mock3 = { name: 'dummy3' }
const mockItems = [mock1, mock2, mock3]

beforeEach(() => {
  items = makeListModule(null, 'item', 'uuid', 'lcrud')
})

afterEach(() => {
  items = null
})

describe('makeListModule', () => {
  test('Store module has correct namespaced state', () => {
    const store = new Vuex.Store({
      modules: {
        items: makeListModule(null, 'item', 'uuid', 'lcrud')
      },
      strict: false
    })

    expect(store.state.items).toBeDefined()
    expect(store.state.items.items).toEqual([])
    expect(store.state.items.itemCrud).toEqual(defaultCrud)
    expect(store.state.items.selectedItem).toBeNull()
  })

  test('module has correct auxiliary mutations', () => {
    expect(items.mutations).toBeDefined()
    expect(items.mutations.selectItem).toBeDefined()
    expect(items.mutations.deselectItem).toBeDefined()
    expect(items.mutations.updateItemsList).toBeDefined()
    expect(items.mutations.changeSelectedItemName).toBeDefined()
  })

  test('Selection with valid item', () => {
    expect(items.state.selectedItem).toBeNull()
    items.state.items = mockItems
    items.mutations.selectItem(items.state, mock1)
    expect(items.state.selectedItem).toEqual(mock1)
  })

  test('Selection with invalid item', () => {
    expect(items.state.selectedItem).toBeNull()
    items.state.items = [mock1]
    items.mutations.selectItem(items.state, mock2)
    // mock2 is nonetheless selected even if it is not part of the list !
    expect(items.state.selectedItem).toEqual(mock2)
  })

  test('Selection with null item', () => {
    expect(items.state.selectedItem).toBeNull()
    items.state.items = mockItems
    items.mutations.selectItem(items.state, null)
    // mock2 is nonetheless selected even if it is not part of the list !
    expect(items.state.selectedItem).toBeNull()
    items.mutations.selectItem(items.state, mock1)
    expect(items.state.selectedItem).toEqual(mock1)
    items.mutations.selectItem(items.state, null)
    expect(items.state.selectedItem).toBeNull()
  })

  test('Deselection', () => {
    expect(items.state.selectedItem).toBeNull()
    items.state.items = mockItems
    items.mutations.selectItem(items.state, mock1)
    expect(items.state.selectedItem).toEqual(mock1)
    items.mutations.deselectItem(items.state)
    expect(items.state.selectedItem).toBeNull()
  })
})

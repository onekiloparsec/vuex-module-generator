import { makeModule } from '@/index'

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

const defaultCrud = { list: false, create: false, read: null, update: null, delete: null }
const API_URL = 'http://localhost:8080/'

describe('test actions creation based on last parameter', () => {
  test('all state and mutations available', () => {
    const listItems = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lcrud',
      allowMultipleSelection: true,
      allowTree: false
    })
    const treeItems = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lcrud',
      allowMultipleSelection: true,
      allowTree: true
    })

    for (const items of [listItems, treeItems]) {
      expect(items.state.items).toEqual([])
      expect(items.state.itemCrud).toEqual(defaultCrud)
      expect(items.state.selectedItems).toEqual([])
      expect(items.state.selectedItem).toEqual(null)

      expect(items.getters.isItemSelected).toBeDefined()

      expect(items.mutations.selectItem).toBeDefined()
      expect(items.mutations.deselectItem).toBeDefined()
      expect(items.mutations.clearItemsSelection).toBeDefined()
      expect(items.mutations.updateItemsList).toBeDefined()

      expect(items.actions.listItems).toBeDefined()
      expect(items.actions.createItem).toBeDefined()
      expect(items.actions.readItem).toBeDefined()
      expect(items.actions.updateItem).toBeDefined()
      expect(items.actions.deleteItem).toBeDefined()
    }
  })

  test('only specified lcrud actions are available', () => {
    const listItems = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lrd',
      allowMultipleSelection: true,
      allowTree: false
    })
    const treeItems = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lrd',
      allowMultipleSelection: true,
      allowTree: true
    })

    for (const items of [listItems, treeItems]) {
      expect(items.mutations['ITEMS_LIST_FETCH_PENDING']).toBeDefined()
      expect(items.mutations['ITEMS_LIST_FETCH_SUCCESS']).toBeDefined()
      expect(items.mutations['ITEMS_LIST_FETCH_FAILURE']).toBeDefined()

      expect(items.mutations['ITEMS_SINGLE_CREATE_PENDING']).not.toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_CREATE_SUCCESS']).not.toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_CREATE_FAILURE']).not.toBeDefined()

      expect(items.mutations['ITEMS_SINGLE_READ_PENDING']).toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_READ_SUCCESS']).toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_READ_FAILURE']).toBeDefined()

      expect(items.mutations['ITEMS_SINGLE_UPDATE_PENDING']).not.toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_UPDATE_SUCCESS']).not.toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_UPDATE_FAILURE']).not.toBeDefined()

      expect(items.mutations['ITEMS_SINGLE_DELETE_PENDING']).toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_DELETE_SUCCESS']).toBeDefined()
      expect(items.mutations['ITEMS_SINGLE_DELETE_FAILURE']).toBeDefined()

      expect(items.actions.listItems).toBeDefined()
      expect(items.actions.createItem).not.toBeDefined()
      expect(items.actions.readItem).toBeDefined()
      expect(items.actions.updateItem).not.toBeDefined()
      expect(items.actions.deleteItem).toBeDefined()
    }
  })
})

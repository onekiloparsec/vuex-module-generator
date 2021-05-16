import { makeModule } from '@/moduleGenerator'
import { buildAPIEndpoint } from '@/endpointsBuilder'

const API_URL = 'http://localhost:8080/'

const http = {
  get: jest.fn(),
  options: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}

describe('test moduleGenerator', () => {
  describe('[module definitions - full lcrusd - no pages]', () => {
    let items = null

    beforeEach(() => {
      const endpoint = buildAPIEndpoint(http, API_URL, 'items/')
      items = makeModule({
        apiEndpoint: endpoint, rootName: 'item', lcrusd: 'lcrusd', idKey: 'uuid'
      })
    })

    test('test module state', () => {
      expect(items.state).not.toBeNull()
      expect(items.state.items).toEqual([])
      expect(items.state.itemsDataMap).toEqual({})
      expect(items.state.itemsLoadingStatus).toEqual({ 'create': false, 'delete': null, 'list': false, 'read': null, 'swap': null, 'update': null })
      expect(items.state.selectedItem).toEqual(null)
      expect(items.state.selectedItems).toEqual([])
      expect(items.state.currentItemsPage).toBeUndefined()
      expect(items.state.totalItemsPageCount).toBeUndefined()
    })

    test('test module getters', () => {
      expect(items.getters).toEqual({})
    })

    test('test module list mutations', () => {
      expect(items.mutations.listItemsPending).toBeDefined()
      expect(items.mutations.listItemsSuccess).toBeDefined()
      expect(items.mutations.listItemsPartialSuccess).toBeUndefined()
      expect(items.mutations.listItemsFailure).toBeDefined()
    })

    test('test module create mutations', () => {
      expect(items.mutations.createItemPending).toBeDefined()
      expect(items.mutations.createItemSuccess).toBeDefined()
      expect(items.mutations.createItemFailure).toBeDefined()
    })

    test('test module read mutations', () => {
      expect(items.mutations.readItemPending).toBeDefined()
      expect(items.mutations.readItemSuccess).toBeDefined()
      expect(items.mutations.readItemFailure).toBeDefined()
    })

    test('test module update mutations', () => {
      expect(items.mutations.updateItemPending).toBeDefined()
      expect(items.mutations.updateItemSuccess).toBeDefined()
      expect(items.mutations.updateItemFailure).toBeDefined()
    })

    test('test module swap mutations', () => {
      expect(items.mutations.swapItemPending).toBeDefined()
      expect(items.mutations.swapItemSuccess).toBeDefined()
      expect(items.mutations.swapItemFailure).toBeDefined()
    })

    test('test module delete mutations', () => {
      expect(items.mutations.deleteItemPending).toBeDefined()
      expect(items.mutations.deleteItemSuccess).toBeDefined()
      expect(items.mutations.deleteItemFailure).toBeDefined()
    })

    test('test module actions', () => {
      expect(items.actions.listItems).toBeDefined()
      expect(items.actions.createItem).toBeDefined()
      expect(items.actions.readItem).toBeDefined()
      expect(items.actions.updateItem).toBeDefined()
      expect(items.actions.swapItem).toBeDefined()
      expect(items.actions.deleteItem).toBeDefined()
    })
  })

  describe('[module definitions - partial lcrusd - with pages]', () => {
    let items = null

    beforeEach(() => {
      const endpoint = buildAPIEndpoint(http, API_URL, 'items/')
      items = makeModule({
        apiEndpoint: endpoint, rootName: 'item', lcrusd: 'pr', idKey: 'uuid'
      })
    })
    test('test module state', () => {
      expect(items.state).not.toBeNull()
      expect(items.state.items).toEqual([])
      expect(items.state.itemsDataMap).toEqual({})
      expect(items.state.itemsLoadingStatus).toEqual({ 'create': false, 'delete': null, 'list': false, 'read': null, 'swap': null, 'update': null })
      expect(items.state.selectedItem).toEqual(null)
      expect(items.state.selectedItems).toEqual([])
      expect(items.state.currentItemsPage).toBeDefined()
      expect(items.state.totalItemsPageCount).toBeDefined()
    })

    test('test module getters', () => {
      expect(items.getters).toEqual({})
    })

    test('test module list mutations', () => {
      expect(items.mutations.listItemsPending).toBeDefined()
      expect(items.mutations.listItemsSuccess).toBeDefined()
      expect(items.mutations.listItemsPartialSuccess).toBeDefined()
      expect(items.mutations.listItemsFailure).toBeDefined()
    })

    test('test module create mutations', () => {
      expect(items.mutations.createItemPending).toBeUndefined()
      expect(items.mutations.createItemSuccess).toBeUndefined()
      expect(items.mutations.createItemFailure).toBeUndefined()
    })

    test('test module read mutations', () => {
      expect(items.mutations.readItemPending).toBeDefined()
      expect(items.mutations.readItemSuccess).toBeDefined()
      expect(items.mutations.readItemFailure).toBeDefined()
    })

    test('test module update mutations', () => {
      expect(items.mutations.updateItemPending).toBeUndefined()
      expect(items.mutations.updateItemSuccess).toBeUndefined()
      expect(items.mutations.updateItemFailure).toBeUndefined()
    })

    test('test module swap mutations', () => {
      expect(items.mutations.swapItemPending).toBeUndefined()
      expect(items.mutations.swapItemSuccess).toBeUndefined()
      expect(items.mutations.swapItemFailure).toBeUndefined()
    })

    test('test module delete mutations', () => {
      expect(items.mutations.deleteItemPending).toBeUndefined()
      expect(items.mutations.deleteItemSuccess).toBeUndefined()
      expect(items.mutations.deleteItemFailure).toBeUndefined()
    })

    test('test module actions', () => {
      expect(items.actions.listItems).toBeDefined()
      expect(items.actions.createItem).toBeUndefined()
      expect(items.actions.readItem).toBeDefined()
      expect(items.actions.updateItem).toBeUndefined()
      expect(items.actions.swapItem).toBeUndefined()
      expect(items.actions.deleteItem).toBeUndefined()
    })
  })
})

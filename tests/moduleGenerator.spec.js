import Vue from 'vue'
import Vuex from 'vuex'

import { makeStoreModule } from '@/moduleGenerator'

const API_URL = 'http://localhost:8080/'

const remoteObjects = [{ uuid: '123', name: 'obj1' }, { uuid: '234', name: 'obj2' }]

Vue.use(Vuex)

describe('moduleGenerator', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('[module definitions - full lcrusd - no pages]', () => {
    let items = null

    beforeEach(() => {
      const http = {
        get: jest.fn().mockResolvedValue({}),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }

      items = makeStoreModule({
        http: http, baseURL: API_URL, resourcePath: 'items/', rootName: 'item', lcrusd: 'lcrusd', idKey: 'uuid'
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
      const http = {
        get: jest.fn().mockResolvedValue({}),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }

      items = makeStoreModule({
        http: http, baseURL: API_URL, resourcePath: 'items/', rootName: 'item', lcrusd: 'pr', idKey: 'uuid'
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

  describe('[module actions dispatch - full lcrusd - no pages]', () => {
    let items = null
    let store = null
    let http = null

    beforeEach(() => {
      http = {
        get: jest.fn().mockResolvedValue({ data: { uuid: '123' } }),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }
      items = makeStoreModule({
        http: http,
        baseURL: API_URL,
        resourcePath: 'items/',
        rootName: 'item',
        lcrusd: 'lcrusd',
        idKey: 'uuid'
      })
      store = new Vuex.Store({ modules: { items } })
    })

    test('access to endpoint', () => {
      expect(items._endpoint).toBeDefined()
    })

    test('list action', () => {
      store.dispatch('items/listItems')
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/`)
    })

    test('list action with payload', () => {
      const payload = { search: 'toto' }
      store.dispatch('items/listItems', payload)
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/?search=toto`)
    })

    test('create action', () => {
      const payload = { name: 'toto' }
      store.dispatch('items/createItem', payload)
      expect(http.post).toHaveBeenCalledWith(`${API_URL}items/`, payload)
    })

    test('read action', () => {
      store.dispatch('items/readItem', 'HD 5980')
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/HD 5980/`)
    })

    test('update action', () => {
      const payload = { uuid: '1234', data: { name: 'toto' } }
      store.dispatch('items/updateItem', payload)
      expect(http.patch).toHaveBeenCalledWith(`${API_URL}items/1234/`, payload.data)
    })

    test('swap action', () => {
      const payload = { uuid: '1234', data: { name: 'toto' } }
      store.dispatch('items/swapItem', payload)
      expect(http.put).toHaveBeenCalledWith(`${API_URL}items/1234/`, payload.data)
    })

    test('delete action', () => {
      store.dispatch('items/deleteItem', 'HD 5980')
      expect(http.delete).toHaveBeenCalledWith(`${API_URL}items/HD 5980/`)
    })
  })

  // describe('[module action-mutations commits - full lcrusd - no pages]', () => {
  //   let items = null
  //   let store = null
  //   let http = null
  //
  //   beforeEach(() => {
  //     http = {
  //       get: jest.fn().mockResolvedValueOnce({ data: remoteObjects }),
  //       options: jest.fn().mockResolvedValue({}),
  //       post: jest.fn().mockResolvedValue({}),
  //       put: jest.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       patch: jest.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       delete: jest.fn().mockResolvedValue({})
  //     }
  //     items = makeStoreModule({
  //       http: http,
  //       baseURL: API_URL,
  //       rootName: 'item',
  //       lcrusd: 'lcrusd',
  //       idKey: 'uuid'
  //     })
  //     for (let key of Object.keys(items.mutations)) {
  //       items.mutations[key] = jest.fn()
  //     }
  //     store = new Vuex.Store({ modules: { items } })
  //   })
  //
  //   afterEach(() => {
  //     jest.clearAllMocks()
  //     jest.resetAllMocks()
  //   })
  //
  //   test('mutations for listItems', async (done) => {
  //     store.dispatch('items/listItems')
  //     // expect.any(Object) is the vuex state object passed by vuex.
  //     expect(items.mutations.listItemsPending).toHaveBeenCalledWith(expect.any(Object), undefined)
  //     setTimeout(() => {
  //       expect(items.mutations.listItemsSuccess).toHaveBeenCalledWith(expect.any(Object), remoteObjects)
  //       done()
  //     }, 10)
  //   })
  // })

  describe('[module select-mutations commits - full lcrusd - no pages]', () => {
    let items = null
    let store = null

    beforeEach(() => {
      const http = {
        get: jest.fn().mockResolvedValue({}),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }
      items = makeStoreModule({
        http: http,
        baseURL: API_URL,
        resourcePath: 'items/',
        rootName: 'item',
        lcrusd: 'lcrusd',
        idKey: 'uuid'
      })
      store = new Vuex.Store({ modules: { items } })
      store.commit('items/updateItemsList', remoteObjects)
    })

    test('update the list', () => {
      expect(store.state.items.items).toEqual(remoteObjects)
    })

    test('select an item of the list', () => {
      store.commit('items/selectItem', remoteObjects[1])
      expect(store.state.items.selectedItems).toEqual([remoteObjects[1]])
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
    })

    test('select a null at cold start', () => {
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItems).toEqual([])
      expect(store.state.items.selectedItem).toEqual(null)
    })

    test('select a null after a select of an object in the list', () => {
      // Ok that may be strange, as it doesn't change the selection at all.
      store.commit('items/selectItem', remoteObjects[1])
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItems).toEqual([remoteObjects[1]])
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
    })

    test('select multiple items of the list', () => {
      store.commit('items/selectMultipleItems', remoteObjects)
      expect(store.state.items.selectedItems).toEqual(remoteObjects)
      expect(store.state.items.selectedItem).toEqual(null)
    })
  })
})

import Vue from 'vue'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'

import makeStoreModule from '@/index'

const API_URL = 'http://localhost:8080/'

const remoteObjects = [{ uuid: '123', name: 'obj1' }, { uuid: '234', name: 'obj2' }]

Vue.use(Vuex)

describe('moduleGenerator', () => {
  describe('[actions - list]', () => {
    let items = null
    let store = null
    let http = null
    let obj1 = { uuid: '123', name: 'HD 5980' }
    let obj2 = { uuid: '765', name: 'HD 5981' }

    beforeEach(() => {
      http = {
        get: jest.fn().mockResolvedValue({ data: [obj1, obj2] }),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      }
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid' })
        .generateActions({ http, baseURL: API_URL, resourcePath: 'items/', lcrusd: 'lcrusd' })
      store = new Vuex.Store({ modules: { items } })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('access to endpoint', () => {
      expect(items._endpoint).toBeDefined()
    })

    test('list action', async () => {
      await store.dispatch('items/listItems')
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/`)
    })

    test('list action with payload', () => {
      const payload = { search: 'toto' }
      store.dispatch('items/listItems', payload)
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/?search=toto`)
    })
  })

  describe('[actions - detail]', () => {
    let items = null
    let store = null
    let http = null
    let obj = { uuid: '123', name: 'HD 5980' }

    beforeEach(() => {
      http = {
        get: jest.fn().mockResolvedValue({ data: obj }),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({ data: obj }),
        put: jest.fn().mockResolvedValue({ data: obj }),
        patch: jest.fn().mockResolvedValue({ data: obj }),
        delete: jest.fn().mockResolvedValue({})
      }
      items = makeStoreModule({
        rootName: 'item',
        idKey: 'uuid'
      }).generateActions({
        http: http,
        baseURL: API_URL,
        resourcePath: 'items/',
        lcrusd: 'lcrusd'
      })
      store = new Vuex.Store({ modules: { items } })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('create action', () => {
      const payload = { name: 'toto' }
      store.dispatch('items/createItem', payload)
      expect(http.post).toHaveBeenCalledWith(`${API_URL}items/`, payload)
    })

    test('read action', async () => {
      store.dispatch('items/readItem', 'HD 5980')
      await flushPromises()
      expect(http.get).toHaveBeenCalledWith(`${API_URL}items/HD 5980/`)
      expect(store.state.items.items[0]).toEqual(obj)
      store.dispatch('items/readItem', 'HD 5980')
      expect(store.state.items.items[0]).toEqual(obj)
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
  //   let store
  //   let http = null
  //
  //   beforeEach(() => {
  //     http = {
  //       get: jest.fn().mockResolvedValue({ data: remoteObjects }),
  //       options: jest.fn().mockResolvedValue({}),
  //       post: jest.fn().mockResolvedValue({}),
  //       put: jest.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       patch: jest.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       delete: jest.fn().mockResolvedValue({})
  //     }
  //     items = makeStoreModule({
  //       http: http,
  //       baseURL: API_URL,
  //       resourcePath: 'items/',
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
  //   test('mutations for listItems', async () => {
  //     store.dispatch('items/listItems')
  //     await flushPromises()
  //     // expect.any(Object) is the vuex state object passed by vuex.
  //     expect(items.mutations.listItemsPending).toHaveBeenCalledWith(expect.any(Object), undefined)
  //     expect(items.mutations.listItemsSuccess).toHaveBeenCalledWith(expect.any(Object), remoteObjects)
  //   })
  // })

  describe('[module select-mutations commits - single selection]', () => {
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
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid' })
        .generateActions({
          http: http,
          baseURL: API_URL,
          resourcePath: 'items/',
          lcrusd: 'lcrusd'
        })
      store = new Vuex.Store({ modules: { items } })
      store.commit('items/updateItemsList', remoteObjects)
    })

    test('update the list', () => {
      expect(store.state.items.items).toEqual(remoteObjects)
    })

    test('select an item of the list', async () => {
      await store.commit('items/selectItem', remoteObjects[1])
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
    })

    test('select a null at cold start', () => {
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItem).toEqual(null)
    })

    test('select a null after a select of an object in the list', () => {
      // Ok that may be strange, as it doesn't change the selection at all.
      store.commit('items/selectItem', remoteObjects[1])
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
    })

    test('select multiple items of the list', () => {
      expect(store._mutations['items/selectItem']).toBeDefined()
      expect(store._mutations['items/selectMultipleItems']).toBeUndefined()
    })
  })

  describe('[module select-mutations commits - multiple selection]', () => {
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
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid', multiSelection: true })
        .generateActions({
          http: http,
          baseURL: API_URL,
          resourcePath: 'items/',
          lcrusd: 'lcrusd'
        })
      store = new Vuex.Store({ modules: { items } })
      store.commit('items/updateItemsList', remoteObjects)
    })

    test('has correct initial state', () => {
      expect(store.state.items.items).toEqual(remoteObjects)
      expect(store.state.items.selectedItem).toBeNull()
      expect(store.state.items.selectedItems).toEqual([])
    })

    test('select an item of the list', () => {
      store.commit('items/selectItem', remoteObjects[1])
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
      expect(store.state.items.selectedItems).toEqual([remoteObjects[1]])
    })

    test('select a null at cold start', () => {
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItem).toBeNull()
      expect(store.state.items.selectedItems).toEqual([])
    })

    test('select a null after a select of an object in the list', () => {
      // Ok that may be strange, as it doesn't change the selection at all.
      store.commit('items/selectItem', remoteObjects[1])
      store.commit('items/selectItem', null)
      expect(store.state.items.selectedItems).toEqual([remoteObjects[1]])
      expect(store.state.items.selectedItem).toEqual(remoteObjects[1])
    })

    test('select multiple items of the list', () => {
      expect(store._mutations['items/selectItem']).toBeDefined()
      expect(store._mutations['items/selectMultipleItems']).toBeDefined()
    })
  })

  describe('[module attach/detach-mutations commits]', () => {
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
        rootName: 'item',
        idKey: 'uuid'
      }).generateActions({
        http: http,
        baseURL: API_URL,
        resourcePath: 'items/',
        lcrusd: 'lcrusd'
      })
      store = new Vuex.Store({ modules: { items } })
      store.commit('items/updateItemsList', remoteObjects)
    })

    test('initial state of data map', () => {
      expect(store.state.items.itemsDataMap).toEqual({})
    })

    test('attach item data valid payload', () => {
      store.commit('items/attachItemData', { uuid: remoteObjects[0]['uuid'], data: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toEqual({ notes: 'some notes' })
      expect(store.state.items.itemsDataMap[remoteObjects[1]['uuid']]).toBeUndefined()
    })

    test('attach item data unknown id in payload', () => {
      store.commit('items/attachItemData', { uuid: 'dummy', data: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toBeUndefined()
      expect(store.state.items.itemsDataMap[remoteObjects[1]['uuid']]).toBeUndefined()
    })

    test('attach item data invalid id in payload', () => {
      store.commit('items/attachItemData', { wrong_id: remoteObjects[0]['uuid'], data: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toBeUndefined()
      expect(store.state.items.itemsDataMap[remoteObjects[1]['uuid']]).toBeUndefined()
    })

    test('attach item data invalid data in payload', () => {
      store.commit('items/attachItemData', { wrong_id: remoteObjects[0]['uuid'], data2: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toBeUndefined()
      expect(store.state.items.itemsDataMap[remoteObjects[1]['uuid']]).toBeUndefined()
    })

    test('detach item data valid objID', () => {
      store.commit('items/attachItemData', { uuid: remoteObjects[0]['uuid'], data: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toEqual({ notes: 'some notes' })
      store.commit('items/detachItemData', remoteObjects[0]['uuid'])
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toBeUndefined()
    })

    test('detach item data invalid objID', () => {
      store.commit('items/attachItemData', { uuid: remoteObjects[0]['uuid'], data: { notes: 'some notes' } })
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toEqual({ notes: 'some notes' })
      store.commit('items/detachItemData', 'dummy')
      expect(store.state.items.itemsDataMap[remoteObjects[0]['uuid']]).toEqual({ notes: 'some notes' })
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
        rootName: 'item',
        idKey: 'uuid'
      }).generateActions({
        http: http,
        baseURL: API_URL,
        resourcePath: 'items/',
        lcrusd: 'pr'
      })
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

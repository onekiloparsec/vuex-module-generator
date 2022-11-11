import { beforeEach, describe, expect, test, vi } from 'vitest'

import Vuex from 'vuex'

import { makeStoreModule } from '@/index'

const API_URL = 'http://localhost:8080/'

const remoteObjects = [{ uuid: '123', name: 'obj1' }, { uuid: '234', name: 'obj2' }]


describe('moduleGenerator', () => {
  describe('[actions - list]', () => {
    let items = null
    let store = null
    let http = null
    let obj1 = { uuid: '123', name: 'HD 5980' }
    let obj2 = { uuid: '765', name: 'HD 5981' }

    beforeEach(() => {
      http = {
        get: vi.fn().mockResolvedValue({ data: [obj1, obj2] }),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
      }
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid' })
        .generateActions({ http, baseURL: API_URL, resourcePath: 'items/', lcrusd: 'lcrusd' })
      store = new Vuex.Store({ modules: { items } })
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
        get: vi.fn().mockResolvedValue({ data: obj }),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({ data: obj }),
        put: vi.fn().mockResolvedValue({ data: obj }),
        patch: vi.fn().mockResolvedValue({ data: obj }),
        delete: vi.fn().mockResolvedValue({})
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

    test('create action', () => {
      const payload = { name: 'toto' }
      store.dispatch('items/createItem', payload)
      expect(http.post).toHaveBeenCalledWith(`${API_URL}items/`, payload)
    })

    test('read action', async () => {
      await store.dispatch('items/readItem', 'HD 5980')
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
  //       get: vi.fn().mockResolvedValue({ data: remoteObjects }),
  //       options: vi.fn().mockResolvedValue({}),
  //       post: vi.fn().mockResolvedValue({}),
  //       put: vi.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       patch: vi.fn().mockResolvedValue({ data: remoteObjects[0] }),
  //       delete: vi.fn().mockResolvedValue({})
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
  //       items.mutations[key] = vi.fn()
  //     }
  //     store = new Vuex.Store({ modules: { items } })
  //   })
  //
  //   test('mutations for listItems', async () => {
  //     store.dispatch('items/listItems')
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
        get: vi.fn().mockResolvedValue({}),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
      }
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid' })
        .generateActions({
          http: http,
          baseURL: API_URL,
          resourcePath: 'items/',
          lcrusd: 'lcrusd'
        })
      store = new Vuex.Store({ modules: { items } })
      remoteObjects.forEach((obj) => {
        store.commit('items/appendToItemsList', obj)
      })
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
        get: vi.fn().mockResolvedValue({}),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
      }
      items = makeStoreModule({ rootName: 'item', idKey: 'uuid', multiSelection: true })
        .generateActions({
          http: http,
          baseURL: API_URL,
          resourcePath: 'items/',
          lcrusd: 'lcrusd'
        })
      store = new Vuex.Store({ modules: { items } })
      remoteObjects.forEach((obj) => {
        store.commit('items/appendToItemsList', obj)
      })
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
        get: vi.fn().mockResolvedValue({}),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
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
      remoteObjects.forEach((obj) => {
        store.commit('items/appendToItemsList', obj)
      })
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

  describe('[module append/remove-mutations commits]', () => {
    let items = null
    let store = null

    beforeEach(() => {
      const http = {
        get: vi.fn().mockResolvedValue({}),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
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

    test('append to the list with a valid item', () => {
      expect(store.state.items.items).toEqual([])
      store.commit('items/appendToItemsList', remoteObjects[0])
      expect(store.state.items.items).toEqual([remoteObjects[0]])
    })

    test('do not append twice the same object in the list', () => {
      expect(store.state.items.items).toEqual([])
      store.commit('items/appendToItemsList', remoteObjects[0])
      store.commit('items/appendToItemsList', remoteObjects[0])
      expect(store.state.items.items).toEqual([remoteObjects[0]])
    })
  })

  describe('[module definitions - partial lcrusd - with pages]', () => {
    let items = null

    beforeEach(() => {
      const http = {
        get: vi.fn().mockResolvedValue({}),
        options: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
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

    test('test module mutations', () => {
      expect(items.mutations.listItemsPending).toBeDefined()
      expect(items.mutations.listItemsPartialSuccess).toBeDefined()
      expect(items.mutations.listItemsSuccess).toBeDefined()
      expect(items.mutations.listItemsFailure).toBeDefined()
      expect(items.mutations.readItemPending).toBeDefined()
      expect(items.mutations.readItemSuccess).toBeDefined()
      expect(items.mutations.readItemFailure).toBeDefined()

      expect(items.mutations.createItemPending).toBeUndefined()
      expect(items.mutations.updateItemPending).toBeUndefined()
      expect(items.mutations.swapItemPending).toBeUndefined()
      expect(items.mutations.deleteItemPending).toBeUndefined()
    })

    test('test module actions', () => {
      expect(items.actions.listItems).toBeDefined()
      expect(items.actions.readItem).toBeDefined()

      expect(items.actions.createItem).toBeUndefined()
      expect(items.actions.updateItem).toBeUndefined()
      expect(items.actions.swapItem).toBeUndefined()
      expect(items.actions.deleteItem).toBeUndefined()
    })
  })
})

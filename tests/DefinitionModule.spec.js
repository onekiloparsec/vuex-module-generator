import { makeAPIEndpoint, makeModule } from '@/index'

const http = {
  get: jest.fn(),
  options: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

const defaultCrud = { list: false, create: false, read: null, swap: null, update: null, delete: null }
const API_URL = 'http://localhost:8080/'

describe('test actions creation based on last parameter', () => {
  let endpoint = null

  beforeEach(() => {
    endpoint = makeAPIEndpoint({
      http: http,
      baseURL: API_URL,
      resourcePath: 'items/',
      idKey: 'uuid'
    })
  })

  test('all state and mutations available', () => {
    const items = makeModule({
      endpoint,
      root: 'item',
      idKey: 'uuid',
      lcrusd: 'lcrusd',
      allowMultipleSelection: true
    })

    expect(items.state.items).toEqual([])
    expect(items.state.itemsLoadingStatus).toEqual(defaultCrud)
    expect(items.state.selectedItems).toEqual([])
    expect(items.state.selectedItem).toEqual(null)

    expect(items.mutations.selectItem).toBeDefined()
    expect(items.mutations.deselectItem).toBeDefined()
    expect(items.mutations.clearItemsSelection).toBeDefined()
    expect(items.mutations.updateItemsList).toBeDefined()

    expect(items.actions.listItems).toBeDefined()
    expect(items.actions.createItem).toBeDefined()
    expect(items.actions.readItem).toBeDefined()
    expect(items.actions.updateItem).toBeDefined()
    expect(items.actions.deleteItem).toBeDefined()
  })

  test('only specified lcrusd actions are available', () => {
    const items = makeModule({
      endpoint,
      root: 'item',
      idKey: 'uuid',
      lcrusd: 'lrd',
      allowMultipleSelection: true
    })

    expect(items.mutations['listItemsPending']).toBeDefined()
    expect(items.mutations['listItemsSuccess']).toBeDefined()
    expect(items.mutations['listItemsFailure']).toBeDefined()

    expect(items.mutations['createItemPending']).not.toBeDefined()
    expect(items.mutations['createItemSuccess']).not.toBeDefined()
    expect(items.mutations['createItemFailure']).not.toBeDefined()

    expect(items.mutations['readItemPending']).toBeDefined()
    expect(items.mutations['readItemSuccess']).toBeDefined()
    expect(items.mutations['readItemFailure']).toBeDefined()

    expect(items.mutations['updateItemPending']).not.toBeDefined()
    expect(items.mutations['updateItemSuccess']).not.toBeDefined()
    expect(items.mutations['updateItemFailure']).not.toBeDefined()

    expect(items.mutations['deleteItemPending']).toBeDefined()
    expect(items.mutations['deleteItemSuccess']).toBeDefined()
    expect(items.mutations['deleteItemFailure']).toBeDefined()

    expect(items.actions.listItems).toBeDefined()
    expect(items.actions.createItem).not.toBeDefined()
    expect(items.actions.readItem).toBeDefined()
    expect(items.actions.updateItem).not.toBeDefined()
    expect(items.actions.deleteItem).toBeDefined()
  })
})

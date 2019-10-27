import { makeModule } from '@/index'

const http = {
  get: jest.fn(),
  options: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

const defaultCrud = { list: false, create: false, read: null, update: null, delete: null }
const API_URL = 'http://localhost:8080/'

describe('test actions creation based on last parameter', () => {
  test('all state and mutations available', () => {
    const listItems = makeModule({
      http: http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lcrud',
      allowMultipleSelection: true,
      allowTree: false
    })
    const treeItems = makeModule({
      http: http,
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
      http: http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lrd',
      allowMultipleSelection: true,
      allowTree: false
    })
    const treeItems = makeModule({
      http: http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrud: 'lrd',
      allowMultipleSelection: true,
      allowTree: true
    })

    for (const items of [listItems, treeItems]) {
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
    }
  })
})

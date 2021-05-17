import { createModuleNames } from '@/moduleNamesCreator'

describe('test moduleNamesCreator', () => {

  test('state names for items', () => {
    const items = createModuleNames('item')
    expect(items).not.toBeNull()
    expect(items.state.list).toEqual('items')
    expect(items.state.dataMap).toEqual('itemsDataMap')
    expect(items.state.status).toEqual('itemsLoadingStatus')
    expect(items.state.selection).toEqual('selectedItem')
    expect(items.state.multipleSelection).toEqual('selectedItems')
    expect(items.state.pageCurrent).toEqual('currentItemsPage')
    expect(items.state.pageTotal).toEqual('totalItemsPageCount')
  })

  test('crud mutations names for items', () => {
    const items = createModuleNames('item')
    expect(items.mutations.crud.list).toEqual('listItems')
    expect(items.mutations.crud.create).toEqual('createItem')
    expect(items.mutations.crud.read).toEqual('readItem')
    expect(items.mutations.crud.update).toEqual('updateItem')
    expect(items.mutations.crud.swap).toEqual('swapItem')
    expect(items.mutations.crud.delete).toEqual('deleteItem')
  })

  test('selection mutations names for items', () => {
    const items = createModuleNames('item')
    expect(items.mutations.select).toEqual('selectItem')
    expect(items.mutations.selectMultiple).toEqual('selectMultipleItems')
    expect(items.mutations.clearSelection).toEqual('clearItemsSelection')
  })

  test('other mutations names for items', () => {
    const items = createModuleNames('item')
    expect(items.mutations.attachData).toEqual('attachItemData')
    expect(items.mutations.detachData).toEqual('detachItemData')
    expect(items.mutations.updateList).toEqual('updateItemsList')
  })

  test('actions names for items', () => {
    const items = createModuleNames('item')
    expect(items.actions.list).toEqual('listItems')
    expect(items.actions.create).toEqual('createItem')
    expect(items.actions.read).toEqual('readItem')
    expect(items.actions.update).toEqual('updateItem')
    expect(items.actions.swap).toEqual('swapItem')
    expect(items.actions.delete).toEqual('deleteItem')
  })
})

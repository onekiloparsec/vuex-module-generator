import { getStateObject } from '@/state'

describe('test getStateObject', () => {
  test('state initial properties for items', () => {
    const items = getStateObject('item')
    expect(items).not.toBeNull()
    expect(items.items).toEqual([])
    expect(items.itemsDataMap).toEqual({})
    expect(items.itemsLoadingStatus).toEqual({
      list: false,
      create: false,
      read: null,
      update: null,
      swap: null,
      delete: null
    })
    expect(items.selectedItem).toEqual(null)
    expect(items.selectedItems).toEqual([])
    expect(items.currentItemsPage).toEqual(-1)
    expect(items.totalItemsPageCount).toEqual(-1)
    expect(items.lastItemsError).toEqual(null)
  })
})

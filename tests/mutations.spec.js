import { getMutationsObject } from '@/mutations'

const individualActionKeys = ['create', 'read', 'update', 'swap', 'delete']

describe('test getMutationsObject', () => {
  test('mutations functions for items with complete lcrusd', () => {
    const items = getMutationsObject('item', 'pk', 'lcrusd')
    expect(items).not.toBeNull()

    const action = 'list'
    expect(items[`${action}ItemsPending`]).toEqual(expect.any(Function))
    expect(items[`${action}ItemsSuccess`]).toEqual(expect.any(Function))
    expect(items[`${action}ItemsFailure`]).toEqual(expect.any(Function))

    for (let action of individualActionKeys) {
      expect(items[`${action}ItemPending`]).toEqual(expect.any(Function))
      expect(items[`${action}ItemSuccess`]).toEqual(expect.any(Function))
      expect(items[`${action}ItemFailure`]).toEqual(expect.any(Function))
    }

    expect(items.selectItem).toEqual(expect.any(Function))
    expect(items.selectMultipleItems).toBeUndefined()
    expect(items.deselectItem).toEqual(expect.any(Function))
    expect(items.clearItemsSelection).toEqual(expect.any(Function))

    expect(items.attachItemData).toEqual(expect.any(Function))
    expect(items.detachItemData).toEqual(expect.any(Function))
    expect(items.updateItemsList).toEqual(expect.any(Function))
  })
})

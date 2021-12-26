import { describe, expect, test } from 'vitest'
import { getGettersObject } from '@/getters'
import { getStateObject } from '@/state'

const emptyState = getStateObject('item')

const filledState = getStateObject('item')
filledState.items = [{ pk: 1, name: 'item 1' }, { pk: 2, name: 'item 2' }, { pk: 3, name: 'item 3' }]

const dataFilledState = getStateObject('item')
dataFilledState.items = [{ pk: 1, name: 'item 1' }, { pk: 2, name: 'item 2' }, { pk: 3, name: 'item 3' }]
dataFilledState.itemsDataMap[3] = { key1: 'v1', key2: 'v2' }

describe('test getGettersObject', () => {
  test('getters functions for items', () => {
    const items = getGettersObject('item', 'pk')
    expect(items).not.toBeNull()
    expect(items.getItem).toEqual(expect.any(Function))
    expect(items.getItemData).toEqual(expect.any(Function))
  })

  test('getters functions for items with empty state', () => {
    const items = getGettersObject('item', 'pk')
    expect(items).not.toBeNull()
    expect(items.getItem(emptyState)(123456)).toBeNull()
    expect(items.getItemData(emptyState)(123456)).toBeNull()
    expect(items.getItemData(emptyState)(123456, 'dummy_key')).toBeNull()
  })

  test('getters functions for items with filled state', () => {
    const items = getGettersObject('item', 'pk')
    expect(items).not.toBeNull()
    expect(items.getItem(filledState)(123456)).toBeNull()
    expect(items.getItem(filledState)(2)).toEqual({ pk: 2, name: 'item 2' })
    expect(items.getItemData(filledState)(123456)).toBeNull()
    expect(items.getItemData(filledState)(123456, 'dummy_key')).toBeNull()
  })

  test('getters functions for items with data filled state', () => {
    const items = getGettersObject('item', 'pk')
    expect(items).not.toBeNull()
    expect(items.getItem(dataFilledState)(123456)).toBeNull()
    expect(items.getItem(dataFilledState)(3)).toEqual({ pk: 3, name: 'item 3' })
    expect(items.getItemData(dataFilledState)(123456)).toBeNull()
    expect(items.getItemData(dataFilledState)(3)).toEqual({ key1: 'v1', key2: 'v2' })
    expect(items.getItemData(dataFilledState)(3, 'dummy_key')).toBeNull()
  })
})

import { getMutationsObject } from '@/mutations'

describe('test getMutationsObject', () => {
  test('mutations functions for items with complete lcrusd', () => {
    const items = getMutationsObject('item', 'pk', 'lcrusd')
    expect(items).not.toBeNull()
  })
})

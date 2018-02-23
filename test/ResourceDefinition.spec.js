import { makeResource } from '@/index'
import * as config from '@/config'

describe('test actions creation based on last parameter', () => {
  const path = 'items/'
  const uuid = '12345-67890'

  test('resource definition', () => {
    const items = makeResource(path)
    expect(items.url()).toBeDefined()
    expect(items.get).toBeDefined()
    expect(items.options).toBeDefined()
    expect(items.post).toBeDefined()
    expect(items.put).toBeDefined()
    expect(items.delete).toBeDefined()
  })
  test('resource urls', () => {
    const items = makeResource(path)
    expect(items.url()).toEqual(config.default.API_URL + path)
    expect(items.url(uuid)).toEqual(config.default.API_URL + path + uuid + '/')
  })
})

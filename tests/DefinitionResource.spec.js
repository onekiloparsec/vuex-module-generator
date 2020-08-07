import { makeAPIEndpoint } from '@/index'

const http = {
  get: jest.fn(),
  options: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

describe('test actions creation based on last parameter', () => {
  const API_URL = 'http://localhost:8080/'
  const path = 'items/'
  const uuid1 = '12345-67890'
  const uuid2 = '67890-12345'

  test('resource definition', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path })
    expect(items.url()).toBeDefined()
    expect(items.get).toBeDefined()
    expect(items.options).toBeDefined()
    expect(items.post).toBeDefined()
    expect(items.put).toBeDefined()
    expect(items.delete).toBeDefined()
  })

  test('resource urls', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path })
    expect(items.url()).toEqual(API_URL + path)
    expect(items.url(uuid1)).toEqual(API_URL + path + uuid1 + '/')
  })

  test('resource single urls list', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path })
    expect(items.single(uuid1)).toBeDefined()
    expect(items.single(uuid1).url()).toEqual(API_URL + path + uuid1 + '/')
    expect(items.url()).toEqual(API_URL + path) // test that .single() is one shot!!!
  })

  test('resource single urls detail', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path })
    expect(items.single(uuid1)).toBeDefined()
    expect(items.single(uuid1).url(uuid2)).toEqual(API_URL + path + uuid1 + '/' + uuid2 + '/')
    expect(items.url()).toEqual(API_URL + path) // test that .single() is one shot!!!
  })

  test('resource single urls list with subresource', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path }).addSubresource('images/')
    expect(items.single(uuid1)).toBeDefined()
    expect(items.single(uuid1).images).toBeDefined()
    expect(items.single(uuid1).images.url()).toEqual(API_URL + path + uuid1 + '/images/')
    expect(items.url()).toEqual(API_URL + path) // test that .single() is one shot!!!
  })

  test('resource single urls detail with subresource', () => {
    const items = makeAPIEndpoint({ http: http, baseURL: API_URL, resourcePath: path }).addSubresource('images/')
    expect(items.single(uuid1)).toBeDefined()
    expect(items.single(uuid1).images).toBeDefined()
    expect(items.single(uuid1).images.url(uuid2)).toEqual(API_URL + path + uuid1 + '/images/' + uuid2 + '/')
    expect(items.url()).toEqual(API_URL + path) // test that .single() is one shot!!!
  })
})

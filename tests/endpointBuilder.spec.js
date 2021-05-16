import { buildAPIEndpoint } from '@/endpointsBuilder'

const API_URL = 'http://localhost:8080/'

describe('test endpointURLBuilder', () => {
  describe('[Basics]', () => {
    let items = null
    let http = null

    beforeEach(() => {
      http = {
        get: jest.fn(),
        options: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
      }
      items = buildAPIEndpoint({ http, baseURL: API_URL, resourcePath: 'items/', idKey: 'uuid' })
    })

    test('items constructor', () => {
      expect(items).not.toBeNull()
    })

    test('list method without params', () => {
      items.list()
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/')
    })

    test('list method with params', () => {
      items.list({ toto: 'tata' })
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/?toto=tata')
    })

    test('create method', () => {
      const payload = { toto: 'tata' }
      items.create(payload)
      expect(http.post).toHaveBeenCalledWith(API_URL + 'items/', payload)
    })

    test('read method', () => {
      items.read('1-2-3-4')
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })

    test('swap method', () => {
      const payload = { toto: 'tata' }
      items.swap({ uuid: '1-2-3-4', data: payload })
      expect(http.put).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/', payload)
    })

    test('update method', () => {
      const payload = { toto: 'tata' }
      items.update({ uuid: '1-2-3-4', data: payload })
      expect(http.patch).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/', payload)
    })

    test('delete method', () => {
      items.delete('1-2-3-4')
      expect(http.delete).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })

    test('options method', () => {
      items.options('1-2-3-4')
      expect(http.options).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })
  })

  describe('[Subresource]', () => {
    let items = null
    let http = null

    beforeEach(() => {
      http = {
        get: jest.fn(),
        options: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
      }
      items = buildAPIEndpoint({ http, baseURL: API_URL, resourcePath: 'items/', idKey: 'uuid' })
        .addSubresource('images/', 'pk')
    })

    test('items constructor', () => {
      expect(items).not.toBeNull()
    })

    test('single subresource url', () => {
      expect(items.single('2-3-4-5').images.url()).toEqual(`${API_URL}items/2-3-4-5/images/`)
    })

    test('single subresource url for detail', () => {
      expect(items.single('2-3-4-5').images.url('9876')).toEqual(`${API_URL}items/2-3-4-5/images/9876/`)
    })

    test('list method without params', () => {
      items.single('2-3-4-5').images.list()
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/2-3-4-5/images/')
    })
  })
})

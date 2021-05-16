import { buildAPIEndpoint } from '@/endpointsBuilder'

const API_URL = 'http://localhost:8080/'

describe('test endpointURLBuilder', () => {
  describe('[Basics]', () => {
    let endpoint = null
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
      endpoint = buildAPIEndpoint(http, API_URL, 'items/', 'uuid')
    })

    test('endpoint constructor', () => {
      expect(endpoint).not.toBeNull()
    })

    test('list method without params', () => {
      endpoint.list()
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/')
    })

    test('list method with params', () => {
      endpoint.list({ toto: 'tata' })
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/?toto=tata')
    })

    test('create method', () => {
      const payload = { toto: 'tata' }
      endpoint.create(payload)
      expect(http.post).toHaveBeenCalledWith(API_URL + 'items/', payload)
    })

    test('read method', () => {
      endpoint.read('1-2-3-4')
      expect(http.get).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })

    test('swap method', () => {
      const payload = { toto: 'tata' }
      endpoint.swap({ uuid: '1-2-3-4', data: payload })
      expect(http.put).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/', payload)
    })

    test('update method', () => {
      const payload = { toto: 'tata' }
      endpoint.update({ uuid: '1-2-3-4', data: payload })
      expect(http.patch).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/', payload)
    })

    test('delete method', () => {
      endpoint.delete('1-2-3-4')
      expect(http.delete).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })

    test('options method', () => {
      endpoint.options('1-2-3-4')
      expect(http.options).toHaveBeenCalledWith(API_URL + 'items/1-2-3-4/')
    })
  })
})

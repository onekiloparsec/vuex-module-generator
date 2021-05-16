import { makeURLBuilder } from '@/endpointURLBuilder'

const API_URL = 'http://localhost:8080/'

export const buildPortalBaseURL = function (subdomain = 'saao') {
  return API_URL + subdomain + '/'
}

describe('test endpointURLBuilder', () => {
  describe('[Basics]', () => {
    let urlBuilder = null

    beforeEach(() => {
      urlBuilder = makeURLBuilder(API_URL, 'items/')
    })

    test('URL builder constructor', () => {
      expect(urlBuilder).not.toBeNull()
    })

    test('basic list url', () => {
      expect(urlBuilder()).toEqual(`${API_URL}items/`)
    })

    test('basic detail url', () => {
      expect(urlBuilder('1-2-3-4')).toEqual(`${API_URL}items/1-2-3-4/`)
    })

    test('list url with params', () => {
      expect(urlBuilder(null, { 'toto': 'tata' })).toEqual(`${API_URL}items/?toto=tata`)
    })

    test('detail url with params', () => {
      expect(urlBuilder('1-2-3-4', { 'toto': 'tata' })).toEqual(`${API_URL}items/1-2-3-4/?toto=tata`)
    })
  })

  describe('[With URL func]', () => {
    let urlBuilder = null

    beforeEach(() => {
      urlBuilder = makeURLBuilder(buildPortalBaseURL, 'items/')
    })

    test('URL builder constructor', () => {
      expect(urlBuilder).not.toBeNull()
    })

    test('basic list url', () => {
      expect(urlBuilder()).toEqual(`${API_URL}saao/items/`)
    })

    test('basic detail url', () => {
      expect(urlBuilder('1-2-3-4')).toEqual(`${API_URL}saao/items/1-2-3-4/`)
    })

    test('list url with params', () => {
      expect(urlBuilder(null, { 'toto': 'tata' })).toEqual(`${API_URL}saao/items/?toto=tata`)
    })

    test('detail url with params', () => {
      expect(urlBuilder('1-2-3-4', { 'toto': 'tata' })).toEqual(`${API_URL}saao/items/1-2-3-4/?toto=tata`)
    })
  })
})

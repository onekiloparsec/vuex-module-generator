import { makeURLBuilder } from '@/endpointURLBuilder'

const API_URL = 'http://localhost:8080/'

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

  describe('[With parent and single resource ID]', () => {
    let urlBuilder = null

    beforeEach(() => {
      urlBuilder = makeURLBuilder(API_URL, 'items/', { _singleResourceId: '6-7-8-9' })
    })

    test('URL builder constructor', () => {
      expect(urlBuilder).not.toBeNull()
    })

    test('basic list url', () => {
      expect(urlBuilder()).toEqual(`${API_URL}6-7-8-9/items/`)
    })

    test('basic detail url', () => {
      expect(urlBuilder('1-2-3-4')).toEqual(`${API_URL}6-7-8-9/items/1-2-3-4/`)
    })

    test('list url with params', () => {
      expect(urlBuilder(null, { 'toto': 'tata' })).toEqual(`${API_URL}6-7-8-9/items/?toto=tata`)
    })

    test('detail url with params', () => {
      expect(urlBuilder('1-2-3-4', { 'toto': 'tata' })).toEqual(`${API_URL}6-7-8-9/items/1-2-3-4/?toto=tata`)
    })
  })
})

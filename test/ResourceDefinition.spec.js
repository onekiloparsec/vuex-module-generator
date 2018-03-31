import { makeAPIPoint } from '@/index'

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

describe('test actions creation based on last parameter', () => {
  const API_URL = 'http://localhost:8080/'
  const path = 'items/'
  const uuid = '12345-67890'

  test('resource definition', () => {
    const items = makeAPIPoint({ http: Vue.http, baseURL: API_URL, resourcePath: path })
    expect(items.url()).toBeDefined()
    expect(items.get).toBeDefined()
    expect(items.options).toBeDefined()
    expect(items.post).toBeDefined()
    expect(items.put).toBeDefined()
    expect(items.delete).toBeDefined()
  })
  test('resource urls', () => {
    const items = makeAPIPoint({ http: Vue.http, baseURL: API_URL, resourcePath: path })
    expect(items.url()).toEqual(API_URL + path)
    expect(items.url(uuid)).toEqual(API_URL + path + uuid + '/')
  })
})

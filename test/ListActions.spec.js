import { createMutationNames, makeListModule, makeResource } from '@/index'
import * as config from '@/config'
import testAction from './ActionHelper'

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)
Vue.http.options.root = 'https://api.arcsecond.io'

const routes = [
  {
    method: 'GET',
    url: 'items/',
    response: []
  }
]

Vue.http.interceptors.unshift((request, next) => {
  const route = routes.find((item) => {
    return (request.method === item.method && request.url === config.default.API_URL + item.url)
  })
  if (route) {
    next(request.respondWith(route.response, { status: 200 }))
  } else {
    next(request.respondWith({ status: 404, statusText: 'Oh no! Not found!' }))
  }
})

let items = null
const mutationNames = createMutationNames('ITEMS')

const api = makeResource('items/')

describe('test async api actions', () => {
  beforeEach(() => {
    items = makeListModule(api, 'item', 'uuid', 'lcrud')
  })

  afterEach(() => {
    items = null
  })

  // action, payload, state, expectedMutations, done

  test('the list is empty at start', done => {
    testAction(items.actions.listItems, null, {}, [
      { type: mutationNames['list'].PENDING },
      { type: mutationNames['list'].SUCCESS, payload: [] }
    ], done)
  })
})

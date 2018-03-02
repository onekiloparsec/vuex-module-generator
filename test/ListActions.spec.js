import { makeListModule } from '@/index'
import { createMutationNames } from '@/utils'

import testAction from './ActionHelper'

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

const API_URL = 'http://localhost:8080/'
Vue.http.options.root = API_URL

const routes = [
  {
    method: 'GET',
    url: 'items/',
    response: []
  }
]

Vue.http.interceptors.unshift((request, next) => {
  const route = routes.find((item) => {
    return (request.method === item.method && request.url === API_URL + item.url)
  })
  if (route) {
    next(request.respondWith(route.response, { status: 200 }))
  } else {
    next(request.respondWith({ status: 404, statusText: 'Oh no! Not found!' }))
  }
})

let items = null
const mutationNames = createMutationNames('ITEMS')

describe('test async api actions', () => {
  beforeEach(() => {
    items = makeListModule(API_URL, 'items/', 'item', 'uuid', false, 'lcrud')
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

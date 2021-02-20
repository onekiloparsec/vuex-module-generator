import { makeModule } from '@/index'
import testAction from './ActionHelper'

import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'

Vue.use(Vuex)
Vue.use(VueResource)

let tree = null

const API_URL = 'http://localhost:8080/'

describe('test async api actions', () => {
  beforeEach(() => {
    tree = makeModule({
      http: Vue.http,
      apiURL: API_URL,
      apiPath: 'items/',
      root: 'item',
      idKey: 'uuid',
      lcrusd: 'lcrusd',
      allowMultipleSelection: true,
      allowTree: true
    })
  })

  afterEach(() => {
    tree = null
  })

  test('the list is empty at start', done => {
    testAction(
      tree.actions.listItems,
      null,
      {},
      [
        { type: 'listItemsPending' },
        { type: 'listItemsFailure' }
      ],
      done)
  })
})

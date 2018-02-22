import { makeTreeModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'
import nock from 'nock'

Vue.use(Vuex)

let tree = null

const api = nock('http://api.lvh/me:8000').get('/items/').reply(200, [])

const testAction = (action, payload, state, expectedMutations, done) => {
  let count = 0

  // mock commit
  const commit = (type, payload) => {
    const mutation = expectedMutations[count]

    try {
      expect(mutation.type).toEqual(type)
      if (payload) {
        expect(mutation.payload).toEqual(payload)
      }
    } catch (error) {
      done(error)
    }

    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }

  // call the action with mocked store and arguments
  action({ commit, state }, payload)

  // check if no mutations should have been dispatched
  if (expectedMutations.length === 0) {
    expect(count).toEqual(0)
    done()
  }
}

describe('test async api actions', () => {
  beforeEach(() => {
    tree = makeTreeModule(api, 'item', 'uuid', 'lcrud')
  })

  afterEach(() => {
    tree = null
  })

  test('the list is empty at start', done => {
    testAction(tree.actions.listItems, null, {}, [
      { type: 'ITEMS_LIST_FETCH_PENDING' }
    ], done)
  })
})

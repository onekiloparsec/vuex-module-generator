import { makeListModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'
import nock from 'nock'

Vue.use(Vuex)

let items = null

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

beforeEach(() => {
  items = makeListModule(api, 'item', 'uuid', 'lcrud')
})

afterEach(() => {
  items = null
})

test('the list is empty at start', done => {
  testAction(items.actions.listItems, null, {}, [
    { type: 'ITEMS_LIST_FETCH_PENDING' }
  ], done)
})

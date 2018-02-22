import { makeModule } from '@/index'

import Vue from 'vue'
import Vuex from 'vuex'
import nock from 'nock'

Vue.use(Vuex)

const api = nock('http://api.lvh/me:8000').get('/items/').reply(200, [])

describe('test actions creation based on last parameter', () => {
  test('all lcrud actions are available', () => {
    const listItems = makeModule(false, api, 'item', 'uuid', 'lcrud')
    const treeItems = makeModule(true, api, 'item', 'uuid', 'lcrud')

    expect(listItems.actions.listItems).toBeDefined()
    expect(listItems.actions.createItem).toBeDefined()
    expect(listItems.actions.readItem).toBeDefined()
    expect(listItems.actions.updateItem).toBeDefined()
    expect(listItems.actions.deleteItem).toBeDefined()

    expect(treeItems.actions.listItems).toBeDefined()
    expect(treeItems.actions.createItem).toBeDefined()
    expect(treeItems.actions.readItem).toBeDefined()
    expect(treeItems.actions.updateItem).toBeDefined()
    expect(treeItems.actions.deleteItem).toBeDefined()
  })

  test('only specified lcrud actions are available', () => {
    const listItems = makeModule(false, api, 'item', 'uuid', 'lrd')
    const treeItems = makeModule(true, api, 'item', 'uuid', 'lcr')

    expect(listItems.actions.listItems).toBeDefined()
    expect(listItems.actions.createItem).not.toBeDefined()
    expect(listItems.actions.readItem).toBeDefined()
    expect(listItems.actions.updateItem).not.toBeDefined()
    expect(listItems.actions.deleteItem).toBeDefined()

    expect(treeItems.actions.listItems).toBeDefined()
    expect(treeItems.actions.createItem).toBeDefined()
    expect(treeItems.actions.readItem).toBeDefined()
    expect(treeItems.actions.updateItem).not.toBeDefined()
    expect(treeItems.actions.deleteItem).not.toBeDefined()
  })
})

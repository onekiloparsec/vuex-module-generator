import isObject from 'lodash/isObject'
import zipObject from 'lodash/zipObject'
import findIndex from 'lodash/findIndex'
import assign from 'lodash/assign'
import forEach from 'lodash/forEach'
import merge from 'lodash/merge'
import uniq from 'lodash/uniq'
import concat from 'lodash/concat'
import includes from 'lodash/includes'

import { createRequestsBuilder } from './requestsBuilder'
import { makeAPIEndpoint } from './apiEndpointsBuilder'
import { makeDefaultAction, makePagedAPIAction } from './storeActions'

import createModuleNames from './moduleNames'
import createMutationSuccesses from './mutationsSuccesses'

export const TREE_PARENT_ID = 'tree_parent_id'


const makeModule = ({ http, apiURL, apiPath, root, idKey, allowTree, allowMultipleSelection, lcrusd, customGetters }) => {
  lcrusd = lcrusd || 'lr' // read-only
  customGetters = customGetters || {}

  const api = makeAPIEndpoint({ http: http, baseURL: apiURL, resourcePath: apiPath })
  const apiActions = createRequestsBuilder(api, idKey, 'data')
  const moduleNames = createModuleNames(root)
  const mutationSuccesses = createMutationSuccesses(moduleNames.state.list, moduleNames.state.selection, moduleNames.state.singleSelection, idKey)

  const actionNames = ['list', 'create', 'read', 'update', 'swap', 'delete']
  const boolActionNames = ['list', 'create']
  const defaultActionStates = [false, false, null, null, null, null]

  /* ------------ Vuex Elements ------------ */

  const state = {}
  let _getters = {}
  const mutations = {}
  const actions = {}

  /* ------------ Vuex State ------------ */

  state.__allowTree__ = allowTree || false
  state.__allowMultipleSelection__ = allowMultipleSelection || false

  state[moduleNames.state.list] = []
  state[moduleNames.state.crud] = zipObject(actionNames, defaultActionStates)

  state[moduleNames.state.selection] = []
  state[moduleNames.state.singleSelection] = null
  state[moduleNames.state.pageCurrent] = 0 // Pages start at index one (1), not 0.
  state[moduleNames.state.pageTotal] = 0

  /* ------------ Vuex Getters ------------ */

  _getters[moduleNames.getters.isSelected] = (state) => (selectedItem) => {
    return (findIndex(state[moduleNames.state.selection], item => item === selectedItem) !== -1)
  }

  _getters = assign(_getters, customGetters)

  /* ------------ Vuex Mutations ------------ */

  forEach(actionNames.filter(a => includes(lcrusd.replace('p', 'l'), a.charAt(0))), actionName => {
    merge(mutations, {
      [moduleNames.mutations.crud[actionName] + 'Pending'] (state, payload) {
        // payload is only idOrData
        // Update crud state only.
        let value = true
        if (!includes(boolActionNames, actionName)) {
          value = isObject(payload) ? payload[idKey] : payload
        }
        state[moduleNames.state.crud][actionName] = value
        if (actionName === 'list') {
          state[moduleNames.state.pageCurrent] = 0
          state[moduleNames.state.pageTotal] = 0
        }
      },
      [moduleNames.mutations.crud[actionName] + 'Success'] (state, payload) {
        // Update list/tree and selection(s) state
        mutationSuccesses[actionName](state, payload)
        // Update crud state.
        state[moduleNames.state.crud][actionName] = (includes(boolActionNames, actionName)) ? false : null
      },
      [moduleNames.mutations.crud[actionName] + 'Failure'] (state, payload) {
        // payload is only error object
        // Update crud state only
        state[moduleNames.state.crud][actionName] = (includes(boolActionNames, actionName)) ? false : null
      }
    })
  })

  if (includes(lcrusd, 'p')) {
    mutations[moduleNames.mutations.crud['list'] + 'PartialSuccess'] = (state, data) => {
      const { payload, page, total } = data
      state[moduleNames.state.pageCurrent] = page
      state[moduleNames.state.pageTotal] = total || page
      if (page === 1) { // At start, clear list and selection
        mutationSuccesses['list'](state, [])
      }
      // Then, update list/tree and selection(s) state
      mutationSuccesses['partialList'](state, payload)
      // Do not update CRUD state object, since requests are still on going...
    }
  }

  // Non-(L)CRU(S)D mutations :

  mutations[moduleNames.mutations.select] = (state, selectedItem) => {
    if (selectedItem) {
      if (state.__allowMultipleSelection__) {
        state[moduleNames.state.selection] = uniq(concat(state[moduleNames.state.selection], selectedItem))
      } else {
        state[moduleNames.state.singleSelection] = selectedItem
        state[moduleNames.state.selection] = concat([], selectedItem)
      }
    }
  }

  mutations['de' + moduleNames.mutations.select] = (state, selectedItem) => {
    if (selectedItem) {
      const index = findIndex(state[moduleNames.state.selection], item => item === selectedItem)
      if (index !== -1) {
        state[moduleNames.state.selection].splice(index, 1)
      }
      if (state[moduleNames.state.singleSelection] === selectedItem) {
        state[moduleNames.state.singleSelection] = null
      }
    }
  }

  mutations[moduleNames.mutations.clearSelection] = (state) => {
    state[moduleNames.state.selection] = []
    state[moduleNames.state.singleSelection] = null
  }

  mutations[moduleNames.mutations.updateList] = (state, newList) => {
    state[moduleNames.state.list] = newList
  }

  /* ------------ Vuex Actions ------------ */

  forEach(actionNames.filter(a => includes(lcrusd, a.charAt(0))), actionName => {
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makeDefaultAction(mutationName, apiActions[actionName], idKey)
  })

  // Paged List API Action

  if (includes(lcrusd, 'p')) {
    // If we add 'p' to the lcrusd parameter, whatever the presence of an 'l', we override
    // the list action by the paged list one.
    const actionName = 'list'
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makePagedAPIAction(mutationName, apiActions[actionName], idKey)
  }

  return {
    _api: api,
    namespaced: true,
    state,
    getters: _getters,
    mutations,
    actions
  }
}

export { makeModule }

import zipObject from 'lodash/zipObject'
import findIndex from 'lodash/findIndex'
import assign from 'lodash/assign'
import forEach from 'lodash/forEach'
import merge from 'lodash/merge'
import uniq from 'lodash/uniq'
import concat from 'lodash/concat'

import { makeAPIPoint } from './resourceGenerator'
import { makeDefaultAction, makePagedAPIAction } from './storeActions'

import createApiActions from './apiActions'
import createModuleNames from './moduleNames'
import createMutationSuccesses from './mutationsSuccesses'

export const TREE_PARENT_ID = 'tree_parent_id'


const makeModule = ({ http, apiURL, apiPath, root, idKey, allowTree, allowMultipleSelection, lcrud, customGetters }) => {
  lcrud = lcrud || 'lr' // read-only
  customGetters = customGetters || {}

  const api = makeAPIPoint({ http: http, baseURL: apiURL, resourcePath: apiPath })
  const apiActions = createApiActions(api, idKey, 'data')
  const moduleNames = createModuleNames(root)
  const mutationSuccesses = createMutationSuccesses(moduleNames.state.list, moduleNames.state.selection, moduleNames.state.singleSelection, idKey)

  const actionNames = ['list', 'create', 'read', 'update', 'delete']
  const boolActionNames = ['list', 'create']
  const defaultActionStates = [false, false, null, null, null]

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

  forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    merge(mutations, {
      [moduleNames.mutations.crud[actionName] + 'Pending'] (state, payload) {
        // payload is only idOrData
        // Update crud state only.
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? true : payload

        if (actionName === 'list') {
          state[moduleNames.state.pageCurrent] = 0
          state[moduleNames.state.pageTotal] = 0
        }
      },
      [moduleNames.mutations.crud[actionName] + 'Success'] (state, payload) {
        // Update list/tree and selection(s) state
        mutationSuccesses[actionName](state, payload)
        // Update crud state.
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      },
      [moduleNames.mutations.crud[actionName] + 'Failure'] (state, payload) {
        // payload is only error object
        // Update crud state only
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      }
    })
  })

  // Pages List mutations :

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

  // Non-(L)CRUD mutations :

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

  forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makeDefaultAction(mutationName, apiActions[actionName])
  })

  // Paged List API Action

  if (lcrud.includes('p')) {
    // If we add 'p' to the lcrud parameter, whatever the presence of an 'l', we override
    // the list action by the paged list one.
    const actionName = 'list'
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makePagedAPIAction(mutationName, apiActions[actionName])
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

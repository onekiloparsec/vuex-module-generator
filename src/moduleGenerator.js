import zipObject from 'lodash/zipObject'
import findIndex from 'lodash/findIndex'
import assign from 'lodash/assign'
import forEach from 'lodash/forEach'
import merge from 'lodash/merge'
import uniq from 'lodash/uniq'
import concat from 'lodash/concat'

import { makeAPIPoint } from './resourceGenerator'
import { makeDefaultAction } from './storeActions'

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
  state[moduleNames.state.currentPage] = 0

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
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? true : payload
      },
      [moduleNames.mutations.crud[actionName] + 'Success'] (state, payload) {
        mutationSuccesses[actionName](state, payload)
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      },
      [moduleNames.mutations.crud[actionName] + 'Failure'] (state, payload) {
        // payload is only error object
        state[moduleNames.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      }
    })
  })

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
    merge(actions, {
      [moduleNames.actions[actionName]]: makeDefaultAction(moduleNames.mutations.crud, actionName, apiActions)
    })
  })


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

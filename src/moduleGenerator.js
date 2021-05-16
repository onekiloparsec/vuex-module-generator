import zipObject from 'lodash/zipObject'
import assign from 'lodash/assign'
import includes from 'lodash/includes'

import { createModuleNames } from '@/moduleNamesCreator'
import { configureMutations } from '@/moduleMutationsConfigurator'
import { makeDefaultFetchPromise, makePagedFetchPromise } from '@/fetchPromisesMaker'

export const makeDefaultStoreAction = (mutationName, endpointMethodFunc) => ({ commit }, idOrData) => {
  return makeDefaultFetchPromise(mutationName, endpointMethodFunc, commit, idOrData)
}

export const makePagedStoreAction = (mutationName, endpointMethodFunc) => ({ commit }, idOrData) => {
  return makePagedFetchPromise(mutationName, endpointMethodFunc, commit, idOrData)
}

const defaultActionNames = ['list', 'create', 'read', 'update', 'swap', 'delete']
const defaultActionStatuses = [false, false, null, null, null, null]

export const makeStoreModule = ({ http, baseURL, rootName, lcrusd, idKey, allowMultipleSelection, customGetters }) => {
  lcrusd = lcrusd || 'lr' // read-only
  customGetters = customGetters || {}

  const moduleNames = createModuleNames(rootName)
  const activatedActionNames = defaultActionNames.filter(a => includes(lcrusd.replace('p', 'l'), a.charAt(0)))

  /* ------------ Vuex State ------------ */

  const state = {}

  // Default selection: single, not multiple
  state.__allowMultipleSelection__ = allowMultipleSelection || false

  // The container is an array.
  state[moduleNames.state.list] = []
  // Auxiliary data is put inside an object
  state[moduleNames.state.dataMap] = {}
  // Status object distinguish all with bools for list and create (since we have no ID)
  state[moduleNames.state.status] = zipObject(defaultActionNames, defaultActionStatuses)

  // Selection, single or multiple is handled by a list *and* an object.
  state[moduleNames.state.selection] = null
  state[moduleNames.state.selections] = []

  if (includes(lcrusd, 'p')) {
    // If we use paged-list action, add dedicated state.
    state[moduleNames.state.pageCurrent] = 0 // Pages start at index one (1), not 0.
    state[moduleNames.state.pageTotal] = 0
  }

  /* ------------ Vuex Getters ------------ */

  let _getters = {}
  _getters = assign(_getters, customGetters)

  /* ------------ Vuex Mutations ------------ */

  const mutations = configureMutations(activatedActionNames, moduleNames, idKey, lcrusd)

  /* ------------ Vuex Actions ------------ */

  const actions = {}

  // Create default actions for all activated action names defined by lcrusd.
  activatedActionNames.forEach(actionName => {
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makeDefaultStoreAction(mutationName, apiEndpoint[actionName])
  })

  // Paged List API Action: replace list with true paged-list workflow (with a list/GET request).
  if (includes(lcrusd, 'p')) {
    // If we add 'p' to the lcrusd parameter, whatever the presence of an 'l', we override
    // the list action by the paged list one.
    const actionName = 'list'
    const mutationName = moduleNames.mutations.crud[actionName]
    actions[moduleNames.actions[actionName]] = makePagedStoreAction(mutationName, apiEndpoint[actionName], idKey)
  }

  // We have our module.
  return { _endpoint: apiEndpoint, namespaced: true, state, getters: _getters, mutations, actions }
}


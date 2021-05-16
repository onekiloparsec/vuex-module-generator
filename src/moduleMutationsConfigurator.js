import includes from 'lodash/includes'
import merge from 'lodash/merge'
import isObject from 'lodash/isObject'
import uniq from 'lodash/uniq'
import concat from 'lodash/concat'
import findIndex from 'lodash/findIndex'
import head from 'lodash/head'

import { configureSuccessMutations } from '@/moduleMutationsSuccessesConfigurator'

const boolActionNames = ['list', 'create']

export const configureMutations = (activatedActionNames, moduleNames, idKey, lcrusd) => {
  const mutations = {}

  // Warning, for each action, there are 3 mutations: Pending, Success, and Failure.
  // First and last ones are easy ones: basically updating the loading status.
  // Success mutations are dealing with storage of response data, hence see configureSuccessMutations.
  const mutationSuccesses = configureSuccessMutations(moduleNames.state.list, moduleNames.state.selections, moduleNames.state.selection, idKey)

  // Deal with l(ist), c(reate), r(ead), u(pdate), s(wap), d(delete) actions.
  // Corresponds to get, post, get (again), patch, put and delete HTTP methods.
  activatedActionNames.forEach(actionName => {
    merge(mutations, {
      // Pending mutation
      [moduleNames.mutations.crud[actionName] + 'Pending'] (state, payload) {
        // payload is only idOrData. Update status state only.
        // By default, just use boolean stating request is loading/working/pending.
        let value = true
        // But if this is a request for a identified resources, in order to distinguish
        // multiple requests of different resources, set the status value to the ID of that resource.
        if (!includes(boolActionNames, actionName)) {
          value = isObject(payload) ? payload[idKey] : payload
        }
        state[moduleNames.state.status][actionName] = value

        // If we have a pages-list action, reset page status.
        if (actionName === 'list' && includes(lcrusd, 'p')) {
          state[moduleNames.state.pageCurrent] = 0
          state[moduleNames.state.pageTotal] = 0
        }
      },

      // Success mutation
      [moduleNames.mutations.crud[actionName] + 'Success'] (state, payload) {
        // Update list/tree and selection(s) state
        mutationSuccesses[actionName](state, payload)
        // Update status state.
        state[moduleNames.state.status][actionName] = (includes(boolActionNames, actionName)) ? false : null
      },

      // Failure mutation.
      [moduleNames.mutations.crud[actionName] + 'Failure'] (state, payload) {
        // payload is only error object. Update status state only
        state[moduleNames.state.status][actionName] = (includes(boolActionNames, actionName)) ? false : null
      }
    })
  })

  if (includes(lcrusd, 'p')) {
    // Add a partial success mutation when dealing with paged-list action.
    mutations[moduleNames.mutations.crud['list'] + 'PartialSuccess'] = (state, payload) => {
      const { data, page, total } = payload
      state[moduleNames.state.pageCurrent] = page
      state[moduleNames.state.pageTotal] = total || page
      if (page === 1) { // At start, clear list and selection
        mutationSuccesses['list'](state, [])
      }
      // Then, update list/tree and selection(s) state
      mutationSuccesses['partialList'](state, data)
      // Do not update CRUD state object, since requests are still on going...
    }
  }

  /*** Selection mutations **************************************************************************************************************************/

  // Select one item
  mutations[moduleNames.mutations.select] = (state, selectedItem) => {
    if (!selectedItem) {
      return
    }
    state[moduleNames.state.selections] = uniq(concat(state[moduleNames.state.selections], [selectedItem]))
    state[moduleNames.state.selection] = (state[moduleNames.state.selections].length === 1) ? head(state[moduleNames.state.selections]) : null
  }

  // Select multiple items at once. Very important to avoid triggering multiple updates.
  mutations[moduleNames.mutations.selectMultiple] = (state, selectedItems) => {
    if (selectedItems.length === 0) {
      return
    }
    state[moduleNames.state.selections] = uniq(concat(state[moduleNames.state.selections], selectedItems))
    state[moduleNames.state.selection] = (state[moduleNames.state.selections].length === 1) ? head(state[moduleNames.state.selections]) : null
  }

  // Deselect an item.
  mutations['de' + moduleNames.mutations.select] = (state, selectedItem) => {
    if (selectedItem) {
      const index = findIndex(state[moduleNames.state.selections], item => item === selectedItem)
      if (index !== -1) {
        state[moduleNames.state.selections].splice(index, 1)
      }
    }
    state[moduleNames.state.selection] = head(state[moduleNames.state.selections]) || null
  }

  // Clear all selection.
  mutations[moduleNames.mutations.clearSelection] = (state) => {
    state[moduleNames.state.selections] = []
    state[moduleNames.state.selection] = null
  }

  /*** Special mutations ****************************************************************************************************************************/

  // Directly update list of items.
  mutations[moduleNames.mutations.updateList] = (state, newList) => {
    state[moduleNames.state.selections] = []
    state[moduleNames.state.selection] = null
    state[moduleNames.state.list] = newList
  }

  return mutations
}

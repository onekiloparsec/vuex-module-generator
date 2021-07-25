import { capitalizeFirstChar, getActivatedActionKeys, isObject, pluralize } from '@/utils'
import { getStateNames } from '@/state'
import { getMutationsSuccesses } from './crudMutationSuccesses'

export const getCrudMutationNames = (root) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  return {
    list: `list${pluralCapitalized}`,
    create: `create${singularCapitalized}`,
    read: `read${singularCapitalized}`,
    swap: `swap${singularCapitalized}`,
    update: `update${singularCapitalized}`,
    delete: `delete${singularCapitalized}`
  }
}

// Note: lcrusd = string of letters 'lcrusd' defining which action is activated.

export const getCrudMutationsObject = (root, idKey, lcrusd) => {
  const stateNames = getStateNames(root)
  const mutationNames = getCrudMutationNames(root)
  const mutationSuccesses = getMutationsSuccesses(root, idKey)
  const activatedActionKeys = getActivatedActionKeys(lcrusd)

  // Actions not associated with an ID, for which loading status is simply a boolean.
  const boolActionKeys = ['list', 'create']

  const mutations = {}
  activatedActionKeys.forEach(actionKey => {
    const isBoolAction = boolActionKeys.includes(actionKey)

    Object.assign(mutations, {
      // Pending mutation
      [mutationNames[actionKey] + 'Pending'] (state, payload) {
        // payload is only idOrData. This mutation updates the status state only.
        // By default, we just use boolean stating request is loading/working/pending.
        let status = true
        // But if this is a request for an identified resource, in order to distinguish
        // multiple requests of different resources, we set the status value to the ID
        // of that resource.
        if (!isBoolAction) {
          status = isObject(payload) ? payload[idKey] : payload
        }
        state[stateNames.status][actionKey] = status

        // If we have a pages-list action, reset page status.
        if (actionKey === 'list' && lcrusd.includes('p')) {
          state[stateNames.pageCurrent] = 0
          state[stateNames.pageTotal] = 0
        }

        state[stateNames.lastError] = null
      },

      // Success mutation
      [mutationNames[actionKey] + 'Success'] (state, payload) {
        // Update list/tree and selection(s) state
        mutationSuccesses[actionKey](state, payload)
        // Update status state.
        state[stateNames.status][actionKey] = (isBoolAction) ? false : null
      },

      // Failure mutation.
      [mutationNames[actionKey] + 'Failure'] (state, payload) {
        // payload is only error object. Update status state only
        state[stateNames.status][actionKey] = (isBoolAction) ? false : null
        state[stateNames.lastError] = payload
      }
    })

    if (lcrusd.includes('p')) {
      // Add a partial success mutation when dealing with paged-list action.
      mutations[mutationNames['list'] + 'PartialSuccess'] = (state, payload) => {
        const { data, page, total } = payload
        state[stateNames.pageCurrent] = page
        state[stateNames.pageTotal] = total || page
        if (page === 1) { // At start, clear list and selection
          mutationSuccesses['list'](state, [])
        }
        // Then, update list/tree and selection(s) state
        mutationSuccesses['partialList'](state, data)
        // Do not update CRUD state object, since request sequence is still on going...
      }
    }
  })

  return mutations
}

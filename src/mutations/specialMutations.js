import { capitalizeFirstChar, isObject, pluralize } from '@/utils'
import { getStateNames } from '@/state'

const getSpecialMutationNames = (root) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  return {
    attachData: `attach${singularCapitalized}Data`,
    detachData: `detach${singularCapitalized}Data`,
    updateList: `update${pluralCapitalized}List`
  }
}

export const getSpecialMutationsObject = (root, idKey) => {
  const mutations = {}
  const stateNames = getStateNames(root)
  const mutationNames = getSpecialMutationNames(root)

  mutations[mutationNames.attachData] = (state, payload) => {
    const { data, key } = payload
    const itemId = payload[idKey]

    // Process only if we have at least an itemId and data.
    if (itemId && data) {
      // Let say we attach data to object, but with a key
      // (in case of attaching multiple data to a given object)
      if (key) {
        // If object to hold the data doesn't exist, create it,
        // overriding existing attached data if necessary...
        if (!state[stateNames.dataMap][itemId] || !isObject(state[stateNames.dataMap][itemId])) {
          state[stateNames.dataMap][itemId] = {}
        }
        // Attach data to the key attached to the object
        state[stateNames.dataMap][itemId][key] = data
      } else {
        // Attach data to the object
        state[stateNames.dataMap][itemId] = data
      }
      return true
    }
    return false
  }

  mutations[mutationNames.detachData] = (state, objID) => {
    delete state[stateNames.dataMap][objID]
  }

  // Directly update list of items. Can be useful...
  mutations[mutationNames.updateList] = (state, newList) => {
    state[stateNames.list] = newList
    state[stateNames.status] = { 'create': false, 'delete': null, 'list': false, 'read': null, 'swap': null, 'update': null }
    state[stateNames.selection] = null
    state[stateNames.multipleSelection] = []
    state[stateNames.dataMap] = {}
  }

  return mutations
}

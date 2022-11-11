import { capitalizeFirstChar, isObject, pluralize } from '@/utils'
import { getStateNames } from '@/state'

const getSpecialMutationNames = (root) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  return {
    attachData: `attach${singularCapitalized}Data`,
    detachData: `detach${singularCapitalized}Data`,
    appendToList: `appendTo${pluralCapitalized}List`,
    updateList: `update${pluralCapitalized}List`,
    emptyList: `empty${pluralCapitalized}List`
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
    }
  }

  mutations[mutationNames.detachData] = (state, objID) => {
    delete state[stateNames.dataMap][objID]
  }

  mutations[mutationNames.appendToList] = (state, newItem) => {
    const index = state[stateNames.list].findIndex(item => item[idKey] === newItem[idKey])
    if (index === -1) {
      state[stateNames.list].push(newItem)
    }
  }

  mutations[mutationNames.updateList] = (state, newItems) => {
    state[stateNames.list] = newItems
    state[stateNames.status] = { 'create': false, 'delete': null, 'list': false, 'read': null, 'swap': null, 'update': null }
    state[stateNames.selection] = null
    state[stateNames.multipleSelection] = []
    state[stateNames.dataMap] = {}
  }

  mutations[mutationNames.emptyList] = (state) => {
    state[stateNames.list] = []
    state[stateNames.status] = { 'create': false, 'delete': null, 'list': false, 'read': null, 'swap': null, 'update': null }
    state[stateNames.selection] = null
    state[stateNames.multipleSelection] = []
    state[stateNames.dataMap] = {}
  }

  return mutations
}

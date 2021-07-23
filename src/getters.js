import { getStateNames } from '@/state'
import { capitalizeFirstChar } from '@/utils'

export const getGettersObject = (root, idKey) => {
  const singularCapitalized = capitalizeFirstChar(root.toLowerCase())
  const stateNames = getStateNames(root)

  return {
    // Get item by ID
    [`get${singularCapitalized}`]: (state) => (id) => {
      return state[stateNames.list].find(item => item[idKey] === id) || null
    },

    // Get data associated with object, data can potentially also be keyed.
    [`get${singularCapitalized}Data`]: (state) => (id, key) => {
      const data = state[stateNames.dataMap][id] || null
      if (data && key) {
        return data[key] || null
      }
      return data
    }
  }
}

import { getStateNames } from '@/state'
import { capitalizeFirstChar, pluralize } from '@/utils'

const getSelectionMutationNames = (root, multiSelection) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  const names = {
    select: `select${singularCapitalized}`,
    clearSelection: `clear${pluralCapitalized}Selection`
  }
  if (multiSelection) {
    names.selectMultiple = `selectMultiple${pluralCapitalized}`
  }
  return names
}

export const getSelectionsMutationsObject = (root, idKey, multiSelection = false) => {
  const mutations = {}
  const stateNames = getStateNames(root, multiSelection)
  const mutationNames = getSelectionMutationNames(root, multiSelection)

  mutations[mutationNames.select] = (state, selectedItem) => {
    if (!selectedItem) {
      return
    }
    // Select the item
    state[stateNames.selection] = selectedItem
    if (multiSelection && !state[stateNames.multipleSelection].includes(selectedItem)) {
      // Append to selection, if not yet inside it.
      state[stateNames.multipleSelection].push(selectedItem)
    }
  }

  // Create this mutation only of multiSelection is enabled.
  if (multiSelection) {
    // Select multiple items at once. Very important to avoid triggering multiple updates.
    mutations[mutationNames.selectMultiple] = (state, selectedItems) => {
      state[stateNames.multipleSelection] = [...new Set(selectedItems)]
      state[stateNames.selection] = (state[stateNames.multipleSelection].length === 1) ? state[stateNames.multipleSelection][0] : null
    }
  }

  // Clear all selection.
  mutations[mutationNames.clearSelection] = (state) => {
    state[stateNames.selection] = null
    if (multiSelection) {
      state[stateNames.multipleSelection] = []
    }
  }

  return mutations
}

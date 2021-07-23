import { getStateNames } from '@/state'
import { capitalizeFirstChar, pluralize } from '@/utils'

const getSelectionMutationNames = (root) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  return {
    select: `select${singularCapitalized}`,
    selectMultiple: `selectMultiple${pluralCapitalized}`,
    clearSelection: `clear${pluralCapitalized}Selection`
  }
}

export const getSelectionsMutationsObject = (root, idKey, allowMultipleSelection) => {
  const mutations = {}
  const stateNames = getStateNames(root)
  const mutationNames = getSelectionMutationNames(root)

  mutations[mutationNames.select] = (state, selectedItem) => {
    if (!selectedItem) {
      return
    }
    // Select the item
    state[stateNames.selection] = selectedItem
    if (allowMultipleSelection && !state[stateNames.multipleSelection].includes(selectedItem)) {
      // Append to selection, if not yet inside it.
      state[stateNames.multipleSelection].push(selectedItem)
    }
  }

  // Do not create this mutation if not allowed.
  if (allowMultipleSelection) {
    // Select multiple items at once. Very important to avoid triggering multiple updates.
    mutations[mutationNames.selectMultiple] = (state, selectedItems) => {
      if (selectedItems.length === 0) {
        return
      }
      const multipleSelectionSet = new Set(state[stateNames.multipleSelection])
      // Append/merge selection of multiple items.
      for (let item of selectedItems) {
        multipleSelectionSet.add(item)
      }
      // back to an array
      state[stateNames.multipleSelection] = [...multipleSelectionSet]
      // get first, if total is 1
      state[stateNames.selection] = (state[stateNames.multipleSelection].length === 1) ? state[stateNames.multipleSelection][0] : null
    }
  }

  // Deselect an item.
  mutations['de' + mutationNames.select] = (state, selectedItem) => {
    if (!selectedItem) {
      return
    }
    if (state[stateNames.selection] && state[stateNames.selection][idKey] === selectedItem[idKey]) {
      state[stateNames.selection] = null
    }
    if (allowMultipleSelection) {
      const index = state[stateNames.multipleSelection].findIndex(item => item[idKey] === selectedItem[idKey])
      if (index !== -1) {
        state[stateNames.multipleSelection].splice(index, 1)
      }
    }
  }

  // Clear all selection.
  mutations[mutationNames.clearSelection] = (state) => {
    state[stateNames.selection] = null
    state[stateNames.multipleSelection] = []
  }

  return mutations
}

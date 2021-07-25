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
    if (multiSelection) {
      const index = state[stateNames.multipleSelection].findIndex(item => item[idKey] === selectedItem[idKey])
      if (index !== -1) {
        state[stateNames.multipleSelection].splice(index, 1)
      }
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

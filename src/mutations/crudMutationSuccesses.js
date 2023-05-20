import { getStateNames } from '@/state'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
export const getMutationsSuccesses = (root, idKey) => {
  const stateNames = getStateNames(root)

  return {
    // The success mutation for a list action.
    list: (state, items) => {
      // list is list, no need of idOrData here.
      state[stateNames.list] = items
      // get list of item IDs
      const itemIds = items.map(item => item[idKey])
      // if there is a selection that couldn't be found in new items list, clear selection
      if (!!state[stateNames.selection] && !itemIds.includes(state[stateNames.selection][idKey])) {
        state[stateNames.selection] = null
      }
      // if there are multiple selected items that couldn't be found in new items list, remove them from selection list
      if (stateNames.multipleSelection && state[stateNames.multipleSelection].length) {
        // filter out items that are not known anymore.
        state[stateNames.multipleSelection] = state[stateNames.multipleSelection].filter(item => itemIds.includes(item[idKey]))
      }
    },

    // The success mutation for a partial list action, in situation of a paged list.
    partialList: (state, items) => {
      // Append new items inside list
      state[stateNames.list].push(...items)
      // get list of item IDs
      const itemIds = items.map(item => item[idKey])
      // if there is a selection that couldn't be found in new items list, clear selection
      if (!!state[stateNames.selection] && !itemIds.includes(state[stateNames.selection][idKey])) {
        state[stateNames.selection] = null
      }
      // if there are multiple selected items that couldn't be found in new items list, remove them from selection list
      if (stateNames.multipleSelection && state[stateNames.multipleSelection].length) {
        // filter out items that are not known anymore.
        state[stateNames.multipleSelection] = state[stateNames.multipleSelection].filter(item => itemIds.includes(item[idKey]))
      }
    },

    // The success mutation for a post/create action will append object to list.
    create: (state, item) => {
      state[stateNames.list].push(item)
    },

    // The read mutation will replace the object content if it exists already, or push it inside list if not yet present.
    read: (state, item) => {
      const itemId = item[idKey]
      const index = state[stateNames.list].findIndex(item => item[idKey] === itemId)
      if (index > -1) {
        state[stateNames.list].splice(index, 1, item)
      } else {
        state[stateNames.list].push(item)
      }
    },

    // The success mutation of a patch/update action will merge new obj with existing one
    update: (state, item) => {
      const itemId = item[idKey]
      const index = state[stateNames.list].findIndex(item => item[idKey] === itemId)
      if (index > -1) {
        const newItem = { ...state[stateNames.list][index], ...item }
        state[stateNames.list].splice(index, 1, newItem)
        if (!!state[stateNames.selection] && state[stateNames.selection][idKey] === itemId) {
          state[stateNames.selection] = newItem
        }
      } else {
        state[stateNames.list].push(item)
      }
    },

    // The success mutation of a put/swap will do the same as a read mutation success.
    swap: (state, item) => {
      const itemId = item[idKey]
      const index = state[stateNames.list].findIndex(item => item[idKey] === itemId)
      if (index > -1) {
        state[stateNames.list].splice(index, 1, item)
        if (!!state[stateNames.selection] && state[stateNames.selection][idKey] === itemId) {
          state[stateNames.selection] = newItem
        }
      } else {
        state[stateNames.list].push(item)
      }
    },

    // The success mutation of a delete/delete action removes the object from list container,
    // the (multiple) list multipleSelection container and the single selection.
    delete: (state, itemId) => {
      const listIndex = state[stateNames.list].findIndex(item => item[idKey] === itemId)
      if (listIndex > -1) {
        state[stateNames.list].splice(listIndex, 1)
      }
      // Nullish selection of deleted item was the selected one.
      if (state[stateNames.selection] && state[stateNames.selection][idKey] === itemId) {
        state[stateNames.selection] = null
      }
      // Remove from multiple selection of deleted itemm was part of it.
      if (stateNames.multipleSelection && state[stateNames.multipleSelection].length) {
        const multipleSelectionIndex = state[stateNames.multipleSelection].findIndex(item => item[idKey] === itemId)
        if (multipleSelectionIndex > -1) {
          state[stateNames.multipleSelection].splice(multipleSelectionIndex, 1)
        }
      }
    }
  }
}

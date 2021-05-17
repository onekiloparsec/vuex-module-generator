import Vue from 'vue'
import concat from 'lodash/concat'
import includes from 'lodash/includes'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
export const configureSuccessMutations = (listName, idKey, selectionKey, multipleSelectionKey) => ({
  list: (state, itemsList) => {
    // list is list, no need of idOrData here.
    state[listName] = itemsList
    // also clear single selection if necessary
    if (itemsList && includes(itemsList, state[selectionKey]) === false) {
      state[selectionKey] = null
    }
    if (multipleSelectionKey) {
      // filter out items that are not known anymore. do not use IDs! objects may have changed
      state[multipleSelectionKey] = state[multipleSelectionKey].filter(item => includes(itemsList, item))
    }
  },

  partialList: (state, itemsList) => {
    // Append new items inside list
    state[listName].push(...itemsList)
    // also clear single selection if necessary
    if (includes(state[listName], state[selectionKey]) === false) {
      state[selectionKey] = null
    }
    if (multipleSelectionKey) {
      // filter out items that are not known anymore. do not use IDs! objects may have changed
      state[multipleSelectionKey] = state[multipleSelectionKey].filter(item => includes(itemsList, item))
    }
  },

  // CREATE mutation will append object to list.
  create: (state, obj) => {
    state[listName] = concat(state[listName], obj)
  },

  // READ mutation will update the object if it exists already, or push it inside list if not yet present.
  read: (state, obj) => {
    const objID = obj[idKey]
    const index = state[listName].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[listName].splice(index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }
  },

  // UPDATE mutation will do the same as READ
  update: (state, obj) => {
    const objID = obj[idKey]
    const index = state[listName].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[listName].splice(index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }
    // Object being used by reference shouldn't require to update selection(s) container & pointer.
  },

  // SWAP mutation will do the same as READ
  swap: (state, obj) => {
    const objID = obj[idKey]
    const index = state[listName].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[listName].splice(index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }
    // Object being used by reference shouldn't require to update selection(s) container & pointer.
  },

  // DELETE mutation will remove object from list container, (multiple) list multipleSelection container
  // and single selection.
  delete: (state, objID) => {
    const listIndex = state[listName].findIndex(item => item[idKey] === objID)
    if (listIndex > -1) {
      state[listName].splice(listIndex, 1)
      Vue.set(state, listName, new Array(...state[listName]))
    }
    if (state[selectionKey] && state[selectionKey][idKey] === objID) {
      state[selectionKey] = null
    }
    if (multipleSelectionKey) {
      const multipleSelectionIndex = state[multipleSelectionKey].findIndex(item => item[idKey] === objID)
      if (multipleSelectionIndex > -1) {
        state[multipleSelectionKey].splice(multipleSelectionIndex, 1)
        Vue.set(state, multipleSelectionKey, new Array(...state[multipleSelectionKey]))
      }
    }
  }
})

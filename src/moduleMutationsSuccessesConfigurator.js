import Vue from 'vue'
import concat from 'lodash/concat'
import includes from 'lodash/includes'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
export const configureSuccessMutations = (stateModuleNames, idKey) => ({
  list: (state, itemsList) => {
    // list is list, no need of idOrData here.
    state[stateModuleNames.list] = itemsList
    // also clear single selection if necessary
    if (itemsList && includes(itemsList, state[stateModuleNames.selection]) === false) {
      state[stateModuleNames.selection] = null
    }
    if (state[stateModuleNames.multipleSelection]) {
      // filter out items that are not known anymore. do not use IDs! objects may have changed
      state[stateModuleNames.multipleSelection] = state[stateModuleNames.multipleSelection].filter(item => includes(itemsList, item))
    }
  },

  partialList: (state, itemsList) => {
    // Append new items inside list
    state[stateModuleNames.list].push(...itemsList)
    // also clear single selection if necessary
    if (includes(state[stateModuleNames.list], state[stateModuleNames.selection]) === false) {
      state[stateModuleNames.selection] = null
    }
    if (state[stateModuleNames.multipleSelection]) {
      // filter out items that are not known anymore. do not use IDs! objects may have changed
      state[stateModuleNames.multipleSelection] = state[stateModuleNames.multipleSelection].filter(item => includes(itemsList, item))
    }
  },

  // CREATE mutation will append object to list.
  create: (state, obj) => {
    state[stateModuleNames.list] = concat(state[stateModuleNames.list], obj)
  },

  // READ mutation will update the object if it exists already, or push it inside list if not yet present.
  read: (state, obj) => {
    const objID = obj[idKey]
    const index = state[stateModuleNames.list].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[stateModuleNames.list].splice(index, 1, obj)
      Vue.set(state, stateModuleNames.list, new Array(...state[stateModuleNames.list]))
    } else {
      state[stateModuleNames.list].push(obj)
    }
  },

  // UPDATE mutation will do the same as READ
  update: (state, obj) => {
    const objID = obj[idKey]
    const index = state[stateModuleNames.list].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[stateModuleNames.list].splice(index, 1, obj)
      Vue.set(state, stateModuleNames.list, new Array(...state[stateModuleNames.list]))
    } else {
      state[stateModuleNames.list].push(obj)
    }
    // Object being used by reference shouldn't require to update selection(s) container & pointer.
  },

  // SWAP mutation will do the same as READ
  swap: (state, obj) => {
    const objID = obj[idKey]
    const index = state[stateModuleNames.list].findIndex(item => item[idKey] === objID)
    if (index > -1) {
      state[stateModuleNames.list].splice(index, 1, obj)
      Vue.set(state, stateModuleNames.list, new Array(...state[stateModuleNames.list]))
    } else {
      state[stateModuleNames.list].push(obj)
    }
    // Object being used by reference shouldn't require to update selection(s) container & pointer.
  },

  // DELETE mutation will remove object from list container, (multiple) list multipleSelection container
  // and single selection.
  delete: (state, objID) => {
    const listIndex = state[stateModuleNames.list].findIndex(item => item[idKey] === objID)
    if (listIndex > -1) {
      state[stateModuleNames.list].splice(listIndex, 1)
      Vue.set(state, stateModuleNames.list, new Array(...state[stateModuleNames.list]))
    }
    if (state[stateModuleNames.selection] && state[stateModuleNames.selection][idKey] === objID) {
      state[stateModuleNames.selection] = null
    }
    if (state[stateModuleNames.multipleSelection]) {
      const multipleSelectionIndex = state[stateModuleNames.multipleSelection].findIndex(item => item[idKey] === objID)
      if (multipleSelectionIndex > -1) {
        state[stateModuleNames.multipleSelection].splice(multipleSelectionIndex, 1)
        Vue.set(state, stateModuleNames.multipleSelection, new Array(...state[stateModuleNames.multipleSelection]))
      }
    }
  }
})

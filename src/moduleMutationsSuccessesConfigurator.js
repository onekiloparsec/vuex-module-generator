import Vue from 'vue'
import concat from 'lodash/concat'
import includes from 'lodash/includes'

import { mutationsSuccessRUD } from './utils'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
export const configureSuccessMutations = (listName, selectionName, singleSelectionName, idKey) => ({
  list: (state, itemsList) => {
    // list is list, no need of idOrData here.
    state[listName] = itemsList
    // filter out items that are not known anymore. do not use IDs! objects may have changed
    state[selectionName] = state[selectionName].filter(item => includes(itemsList, item))
    // also clear single selection if necessary
    if (itemsList && includes(itemsList, state[singleSelectionName]) === false) {
      state[singleSelectionName] = null
    }
  },

  partialList: (state, itemsList) => {
    // Append new items inside list
    state[listName].push(...itemsList)
    // filter out items that are not known anymore. do not use IDs! objects may have changed
    state[selectionName] = state[selectionName].filter(item => includes(itemsList, item))
    // also clear single selection if necessary
    if (includes(state[listName], state[singleSelectionName]) === false) {
      state[singleSelectionName] = null
    }
  },

  // CREATE mutation will append object to list.
  create: (state, obj) => {
    state[listName] = concat(state[listName], obj)
  },

  // READ mutation will update the object if it exists already, or push it inside list if not yet present.
  read: (state, obj) => {
    const {
      listCursor,
      selectionCursor,
      updateSingleSelection
    } = mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, obj[idKey])

    if (listCursor) {
      listCursor.list.splice(listCursor.index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }

    if (selectionCursor) {
      selectionCursor.list.splice(selectionCursor.index, 1, obj)
      Vue.set(state, selectionName, new Array(...state[selectionName]))
    }

    if (updateSingleSelection) {
      state[singleSelectionName] = obj
    }
  },

  // UPDATE mutation will do the same as READ
  update: (state, obj) => {
    const {
      listCursor,
      selectionCursor,
      updateSingleSelection
    } = mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, obj[idKey])

    if (listCursor) {
      listCursor.list.splice(listCursor.index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }

    if (selectionCursor) {
      selectionCursor.list.splice(selectionCursor.index, 1, obj)
      Vue.set(state, selectionName, new Array(...state[selectionName]))
    }

    if (updateSingleSelection) {
      state[singleSelectionName] = obj
    }
  },

  // SWAP mutation will do the same as READ
  swap: (state, obj) => {
    const {
      listCursor,
      selectionCursor,
      updateSingleSelection
    } = mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, obj[idKey])

    if (listCursor) {
      listCursor.list.splice(listCursor.index, 1, obj)
      Vue.set(state, listName, new Array(...state[listName]))
    } else {
      state[listName].push(obj)
    }

    if (selectionCursor) {
      selectionCursor.list.splice(selectionCursor.index, 1, obj)
      Vue.set(state, selectionName, new Array(...state[selectionName]))
    }

    if (updateSingleSelection) {
      state[singleSelectionName] = obj
    }
  },

  // DELETE mutation will...
  delete: (state, objID) => {
    const {
      listCursor,
      selectionCursor,
      updateSingleSelection
    } = mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, objID)

    if (listCursor) {
      listCursor.list.splice(listCursor.index, 1)
      Vue.set(state, listName, new Array(...state[listName]))
    }

    if (selectionCursor) {
      selectionCursor.list.splice(selectionCursor.index, 1)
      Vue.set(state, selectionName, new Array(...state[selectionName]))
    }

    if (updateSingleSelection) {
      state[singleSelectionName] = null
    }
  }
})

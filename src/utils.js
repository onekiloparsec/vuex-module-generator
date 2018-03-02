import _ from 'lodash'
import Vue from 'vue'

export const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const createAsyncMutation = (type) => ({
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`
})

export const createMutationNames = (listNameUppercase) => ({
  list: createAsyncMutation(`${listNameUppercase}_LIST_FETCH`),
  create: createAsyncMutation(`${listNameUppercase}_SINGLE_CREATE`),
  read: createAsyncMutation(`${listNameUppercase}_SINGLE_READ`),
  update: createAsyncMutation(`${listNameUppercase}_SINGLE_UPDATE`),
  delete: createAsyncMutation(`${listNameUppercase}_SINGLE_DELETE`)
})

export const createModuleNames = (root) => {
  const baseName = root.toLowerCase()
  const word = capitalizeFirstChar(baseName)

  return {
    state: {
      list: `${baseName}s`,
      crud: `${baseName}Crud`,
      selection: `selected${word}s`,
      singleSelection: `selected${word}`
    },

    getters: {
      isSelected: `is${word}Selected`
    },

    mutations: {
      crud: createMutationNames(baseName.toUpperCase() + 'S'),
      select: `select${word}`,
      clearSelection: `clear${word}sSelection`,
      updateList: `update${word}sList`
    },

    actions: { // not put inside an even-more-nested 'crud' object, as in mutations...
      list: `list${word}s`,
      create: `create${word}`,
      read: `read${word}`,
      update: `update${word}`,
      delete: `delete${word}`
    }
  }
}

export const recurseDown = (array, id, iteratee) => {
  let res
  res = iteratee(array, id)
  if (res !== false) {
    _.each(array, (node) => {
      if (res !== false && !_.isNil(node['children'])) {
        res = recurseDown(node['children'], id, iteratee)
      }
      return res
    })
  }
  return res
}

export const findInItemsAndSelection = (itemsList, selectionList, idKey, objId, callback) => {
  const index = _.findIndex(itemsList, item => item[idKey] === objId)
  if (index !== -1) {
    callback(itemsList, index)
    const selectIndex = _.findIndex(selectionList, item => item[idKey] === objId)
    if (selectIndex !== -1) { // the object read/updated/deleted is also part of the selection list
      callback(selectionList, selectIndex)
    }
    return false // to stop recurseDown func.
  }
}

export const mutationSuccessRUD = (state, listName, selectName, idKey, idOrObj, callback) => {
  const id = (typeof idOrObj === 'object') ? idOrObj[idKey] : idOrObj
  if (state.__allowTree__) {
    recurseDown(state[listName], id, (items, pk) => {
      return findInItemsAndSelection(items, state[selectName], idKey, pk, callback)
    })
    Vue.set(state, listName, new Array(...state[listName]))
  } else {
    findInItemsAndSelection(state[listName], state[selectName], idKey, id, callback)
  }
}

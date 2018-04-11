import _ from 'lodash'

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
  let result = null
  result = iteratee(array, id)
  if (_.isNil(result)) {
    _.each(array, (node) => {
      if (_.isNil(result) && !_.isNil(node['children'])) {
        result = recurseDown(node['children'], id, iteratee)
      }
      return result
    })
  }
  return result
}

export const findObjInList = (itemsList, idKey, objId) => {
  const index = _.findIndex(itemsList, item => item[idKey] === objId)
  return (index > -1) ? { list: itemsList, index: index } : null
}

export const findObjInListOrTree = (itemsList, idKey, objID) => {
  return recurseDown(itemsList, objID, (items, pk) => {
    return findObjInList(items, idKey, pk)
  })
}

export const mutationsSuccessRUD = (itemsList, selectionList, singleSelection, idKey, idOrObj, callback) => {
  const objID = (typeof idOrObj === 'object') ? idOrObj[idKey] : idOrObj
  const listCursor = findObjInListOrTree(itemsList, idKey, objID)
  const selectionCursor = findObjInList(selectionList, idKey, objID)
  const updateSingleSelection = (!_.isNil(singleSelection) && singleSelection[idKey] === objID)
  callback(listCursor, selectionCursor, updateSingleSelection)
}

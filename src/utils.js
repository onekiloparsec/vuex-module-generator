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
  const singular = root.toLowerCase()
  const plural = (singular.slice(-1) === 'y') ? singular.substr(0, singular.length - 1) + 'ies' : singular + 's'
  const singularWord = capitalizeFirstChar(singular)
  const pluralWord = capitalizeFirstChar(plural)

  return {
    state: {
      list: `${plural}`,
      crud: `${singular}Crud`,
      selection: `selected${pluralWord}`,
      singleSelection: `selected${singularWord}`
    },

    getters: {
      isSelected: `is${singularWord}Selected`
    },

    mutations: {
      crud: createMutationNames(pluralWord.toUpperCase()),
      select: `select${singularWord}`,
      clearSelection: `clear${pluralWord}Selection`,
      updateList: `update${pluralWord}List`
    },

    actions: { // not put inside an even-more-nested 'crud' object, as in mutations...
      list: `list${pluralWord}`,
      create: `create${singularWord}`,
      read: `read${singularWord}`,
      update: `update${singularWord}`,
      delete: `delete${singularWord}`
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

import isNil from 'lodash/isNil'
import each from 'lodash/each'
import findIndex from 'lodash/findIndex'

export const recurseDown = (array, id, iteratee) => {
  let result = null
  result = iteratee(array, id)
  if (isNil(result)) {
    each(array, (node) => {
      if (isNil(result) && node && !isNil(node['children'])) {
        result = recurseDown(node['children'], id, iteratee)
      }
      return result
    })
  }
  return result
}

const findObjInList = (itemsList, idKey, objId) => {
  const index = findIndex(itemsList, item => item[idKey] === objId)
  return (index > -1) ? { list: itemsList, index: index } : null
}

const findObjInListOrTree = (itemsList, idKey, objID) => {
  return recurseDown(itemsList, objID, (items, pk) => {
    return findObjInList(items, idKey, pk)
  })
}

export const mutationsSuccessRUD = (itemsList, selectionList, singleSelection, idKey, idOrObj) => {
  const objID = (typeof idOrObj === 'object') ? idOrObj[idKey] : idOrObj
  const listCursor = findObjInListOrTree(itemsList, idKey, objID)
  const selectionCursor = findObjInList(selectionList, idKey, objID)
  const updateSingleSelection = (!isNil(singleSelection) && singleSelection[idKey] === objID)
  return { listCursor, selectionCursor, updateSingleSelection }
}

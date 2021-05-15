import isNil from 'lodash/isNil'
import findIndex from 'lodash/findIndex'

const findObjInList = (itemsList, idKey, objId) => {
  const index = findIndex(itemsList, item => item[idKey] === objId)
  return (index > -1) ? { list: itemsList, index: index } : null
}


export const mutationsSuccessRUD = (itemsList, selectionList, singleSelection, idKey, idOrObj) => {
  const objID = (typeof idOrObj === 'object') ? idOrObj[idKey] : idOrObj
  const listCursor = findObjInList(itemsList, idKey, objID)
  const selectionCursor = findObjInList(selectionList, idKey, objID)
  const updateSingleSelection = (!isNil(singleSelection) && singleSelection[idKey] === objID)
  return { listCursor, selectionCursor, updateSingleSelection }
}

export const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const pluralize = (singular) => {
  let plural = singular + 's'
  if (singular.slice(-1) === 'y') {
    plural = singular.substr(0, singular.length - 1) + 'ies'
  } else if (singular.slice(-2) === 'is') {
    plural = singular.substr(0, singular.length - 21) + 'des' // ephemeris -> ephemerides
  }
  return plural
}

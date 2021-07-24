import { capitalizeFirstChar, pluralize } from './utils'

export const getStateNames = (root, multiSelection) => {
  const singular = root.toLowerCase()
  const plural = pluralize(singular)
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(plural)
  const names = {
    list: `${plural}`,
    dataMap: `${plural}DataMap`,
    status: `${plural}LoadingStatus`,
    selection: `selected${singularCapitalized}`,
    pageCurrent: `current${pluralCapitalized}Page`,
    pageTotal: `total${pluralCapitalized}PageCount`,
    lastError: `last${pluralCapitalized}Error`
  }
  if (multiSelection) {
    names.multipleSelection = `selected${pluralCapitalized}`
  }
  return names
}

export const getStateObject = (root, multiSelection = false) => {
  const stateNames = getStateNames(root, multiSelection)
  const obj = {
    [stateNames.list]: [],
    [stateNames.dataMap]: {},
    [stateNames.status]: { list: false, create: false, read: null, update: null, swap: null, delete: null },
    [stateNames.selection]: null,
    [stateNames.pageCurrent]: -1,
    [stateNames.pageTotal]: -1,
    [stateNames.lastError]: null
  }
  if (multiSelection) {
    obj[stateNames.multipleSelection] = []
  }
  return obj
}

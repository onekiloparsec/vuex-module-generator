import { capitalizeFirstChar, pluralize } from '@/utils'

export type VuexModuleState = {
  list: string,
  dataMap: string,
  status: string,
  selection: string,
  multipleSelection: string,
  pageCurrent: string,
  pageTotal: string,
  lastError: string
}

export const getStateNames = (root: string): VuexModuleState => {
  const singular = root.toLowerCase()
  const plural = pluralize(singular)
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(plural)
  return {
    list: `${plural}`,
    dataMap: `${plural}DataMap`,
    status: `${plural}LoadingStatus`,
    selection: `selected${singularCapitalized}`,
    multipleSelection: `selected${pluralCapitalized}`,
    pageCurrent: `current${pluralCapitalized}Page`,
    pageTotal: `total${pluralCapitalized}PageCount`,
    lastError: `last${pluralCapitalized}Error`
  }
}

export const getStateObject = (root: string): Object => {
  const stateNames = getStateNames(root)
  return {
    [stateNames.list]: [],
    [stateNames.dataMap]: {},
    [stateNames.status]: { list: false, create: false, read: null, update: null, swap: null, delete: null },
    [stateNames.selection]: null,
    [stateNames.multipleSelection]: [],
    [stateNames.pageCurrent]: -1,
    [stateNames.pageTotal]: -1,
    [stateNames.lastError]: null
  }
}

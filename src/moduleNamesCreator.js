import { capitalizeFirstChar, pluralize } from '@/utils'

export const createModuleNames = (root) => {
  const singular = root.toLowerCase()
  const plural = pluralize(singular)
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(plural)

  return {
    state: {
      list: `${plural}`,
      status: `${plural}LoadingStatus`,
      selection: `selected${singularCapitalized}`,
      selections: `selected${pluralCapitalized}`,
      pageCurrent: `current${pluralCapitalized}Page`,
      pageTotal: `total${pluralCapitalized}PageCount`
    },

    mutations: {
      crud: {
        list: `list${pluralCapitalized}`,
        create: `create${singularCapitalized}`,
        read: `read${singularCapitalized}`,
        swap: `swap${singularCapitalized}`,
        update: `update${singularCapitalized}`,
        delete: `delete${singularCapitalized}`
      },
      select: `select${singularCapitalized}`,
      selectMultiple: `selectMultiple${pluralCapitalized}`,
      clearSelection: `clear${pluralCapitalized}Selection`,
      updateList: `update${pluralCapitalized}List`
    },

    actions: {
      list: `list${pluralCapitalized}`,
      create: `create${singularCapitalized}`,
      read: `read${singularCapitalized}`,
      swap: `swap${singularCapitalized}`,
      update: `update${singularCapitalized}`,
      delete: `delete${singularCapitalized}`
    }
  }
}

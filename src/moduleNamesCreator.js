const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

const pluralize = (singular) => {
  let plural = singular + 's'
  if (singular.slice(-1) === 'y') {
    plural = singular.substr(0, singular.length - 1) + 'ies'
  } else if (singular.slice(-2) === 'is') {
    plural = singular.substr(0, singular.length - 21) + 'des' // ephemeris -> ephemerides
  }
  return plural
}

export const createModuleNames = (root) => {
  const singular = root.toLowerCase()
  const plural = pluralize(singular)
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(plural)

  return {
    state: {
      list: `${plural}`,
      dataMap: `${plural}DataMap`,
      status: `${plural}LoadingStatus`,
      selection: `selected${singularCapitalized}`,
      multipleSelection: `selected${pluralCapitalized}`,
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
      attachData: `attach${singularCapitalized}Data`,
      detachData: `detach${singularCapitalized}Data`,
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

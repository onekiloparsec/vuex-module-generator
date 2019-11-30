const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

const createModuleNames = (root) => {
  const singular = root.toLowerCase()
  const plural = (singular.slice(-1) === 'y') ? singular.substr(0, singular.length - 1) + 'ies' : singular + 's'
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(plural)

  return {
    state: {
      list: `${plural}`,
      crud: `${singular}Crud`,
      selection: `selected${pluralCapitalized}`,
      singleSelection: `selected${singularCapitalized}`,
    },

    getters: {
      isSelected: `is${singularCapitalized}Selected`
    },

    mutations: {
      crud: {
        list: `list${pluralCapitalized}`,
        create: `create${singularCapitalized}`,
        read: `read${singularCapitalized}`,
        update: `update${singularCapitalized}`,
        delete: `delete${singularCapitalized}`
      },
      select: `select${singularCapitalized}`,
      clearSelection: `clear${pluralCapitalized}Selection`,
      updateList: `update${pluralCapitalized}List`
    },

    actions: { // not put inside an even-more-nested 'crud' object, as in mutations...
      list: `list${pluralCapitalized}`,
      create: `create${singularCapitalized}`,
      read: `read${singularCapitalized}`,
      update: `update${singularCapitalized}`,
      delete: `delete${singularCapitalized}`
    }
  }
}

export default createModuleNames

const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

const createModuleNames = (root) => {
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
      crud: {
        list: `list${pluralWord}`,
        create: `create${singularWord}`,
        read: `read${singularWord}`,
        update: `update${singularWord}`,
        delete: `delete${singularWord}`
      },
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

export default createModuleNames

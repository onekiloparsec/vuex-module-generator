import { capitalizeFirstChar, pluralize } from '@/utils'

export const getActionsNames = (root, subresources) => {
  const singular = root.toLowerCase()
  const singularCapitalized = capitalizeFirstChar(singular)
  const pluralCapitalized = capitalizeFirstChar(pluralize(singular))
  const names = {
    list: `list${pluralCapitalized}`,
    create: `create${singularCapitalized}`,
    read: `read${singularCapitalized}`,
    swap: `swap${singularCapitalized}`,
    update: `update${singularCapitalized}`,
    delete: `delete${singularCapitalized}`
  }

  names.readSubresources = []
  for (let subresource of subresources) {
    names.readSubresources.push(`read${singularCapitalized}${capitalizeFirstChar(subresource)}`)
  }

  return names
}

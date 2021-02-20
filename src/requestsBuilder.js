import isString from 'lodash/isString'
import isNil from 'lodash/isNil'

import { TREE_PARENT_ID } from './moduleGenerator'

// Create an extended CRUD requests builder.
// This is a kind of HTTP-verbs-to-REST-actions translator.

const makeExtendedCrudRequests = (endpoint, idKey, dataKey) => ({
  list: (obj) => {
    if (isString(obj)) {
      return endpoint.get(obj, null) // obj as complement of list endpoint path. Counter-REST principle, but useful sometimes...
    } else {
      return endpoint.get(null, obj) // obj is used a URL parameters.
    }
  },
  create: (obj) => {
    // Here the presence of TREE_PARENT_ID decides whether one add a child to a tree, or simply an item to a list
    if (isNil(obj[TREE_PARENT_ID])) {
      return endpoint.post(obj) // obj is assumed to be an object. Used as new Object properties
    } else {
      return endpoint.subresource(obj[TREE_PARENT_ID].toString() + '/').post(obj[dataKey])
    }
  },
  read: (obj) => endpoint.get(obj.toString()), // obj is assumed to be a id string.
  swap: (obj) => endpoint.put(obj[idKey].toString(), obj[dataKey]), // obj is assumed to be an object, inside which we have an id, and a data payload.
  update: (obj) => endpoint.patch(obj[idKey].toString(), obj[dataKey]), // obj is assumed to be an object, inside which we have an id, and a data payload.
  delete: (obj) => endpoint.delete(obj.toString()) // // idOrData is assumed to be a id.
})

export { makeExtendedCrudRequests }

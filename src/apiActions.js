import isString from 'lodash/isString'
import isNil from 'lodash/isNil'

import { TREE_PARENT_ID } from './moduleGenerator'

const createApiActions = (api, idKey, dataKey) => ({
  list: (obj) => {
    if (isString(obj)) {
      return api.get(obj, null) // obj as complement of list endpoint path
    } else {
      return api.get(null, obj) // obj is used a URL parameters.
    }
  },
  create: (obj) => {
    // Here the presence of TREE_PARENT_ID decides whether one add a child to a tree, or simply an item to a list
    if (isNil(obj[TREE_PARENT_ID])) {
      return api.post(obj) // obj is assumed to be an object. Used as new Object properties
    } else {
      return api.subresource(obj[TREE_PARENT_ID].toString() + '/').post(obj[dataKey])
    }
  },
  read: (obj) => api.get(obj.toString()), // obj is assumed to be a id string.
  update: (obj) => api.put(obj[idKey].toString(), obj[dataKey]), // obj is assumed to be an object, inside which we have an id, and a data payload.
  delete: (obj) => api.delete(obj.toString()) // // idOrData is assumed to be a id.
})

export default createApiActions

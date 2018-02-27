import _ from 'lodash'

export const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const createAsyncMutation = (type) => ({
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`
})

export const createMutationNames = (listNameUppercase) => ({
  list: createAsyncMutation(`${listNameUppercase}_LIST_FETCH`),
  create: createAsyncMutation(`${listNameUppercase}_SINGLE_CREATE`),
  read: createAsyncMutation(`${listNameUppercase}_SINGLE_READ`),
  update: createAsyncMutation(`${listNameUppercase}_SINGLE_UPDATE`),
  delete: createAsyncMutation(`${listNameUppercase}_SINGLE_DELETE`)
})

export const createFuncNames = (word) => ({
  list: `list${word}s`,
  create: `create${word}`,
  read: `read${word}`,
  update: `update${word}`,
  delete: `delete${word}`
})

export const recurseDown = (array, id, iteratee) => {
  let res
  res = iteratee(array, id)
  if (res !== false) {
    _.each(array, (node) => {
      if (res !== false && !_.isNil(node['children'])) {
        res = recurseDown(node['children'], id, iteratee)
      }
      return res
    })
  }
  return res
}

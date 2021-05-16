import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'
import forEach from 'lodash/forEach'

export const makeURLBuilder = (baseURL, resourcePath, parent = null) => {
  return function (uuid, params) {
    let path = baseURL

    if (parent && parent._singleResourceId) {
      path += parent._singleResourceId + '/'
      parent._singleResourceId = null
    }

    path += resourcePath

    if (uuid) {
      if (isString(uuid)) {
        path += uuid + '/'
      } else if (isNumber(uuid)) {
        path += uuid.toString() + '/'
      }
    }

    if (params && isObject(params)) {
      let index = 0
      forEach(params, function (value, key) {
        const letter = (index === 0) ? '?' : '&'
        path += letter + key + '=' + value
        index += 1
      })
    }

    return path
  }
}

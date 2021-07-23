import { isNumber, isObject, isString } from '@/utils'

export const makeURLBuilder = function ({ baseURL, resourcePath, subPath = '', parent = null }) {
  return function (uuid, params) {
    let path = baseURL + resourcePath

    if (parent && parent._singleResourceId) {
      path += parent._singleResourceId + '/'
      parent._singleResourceId = null
    } else if (this._singleResourceId) {
      path += this._singleResourceId + '/'
      this._singleResourceId = null
    }

    if (path.slice(-1) !== '/') {
      path += '/'
    }

    if (subPath) {
      path += subPath
    }

    if (path.slice(-1) !== '/') {
      path += '/'
    }

    if (uuid) {
      if (isString(uuid)) {
        path += uuid + '/'
      } else if (isNumber(uuid)) {
        path += uuid.toString() + '/'
      }
    }

    if (params && isObject(params)) {
      let index = 0
      Object.keys(params).forEach((key) => {
        const letter = (index === 0) ? '?' : '&'
        path += letter + key + '=' + params[key]
        index += 1
      })
    }

    return path
  }
}

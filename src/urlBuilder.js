import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'
import forEach from 'lodash/forEach'

export const makeURLBuilder = (obj, baseURL) => (uuid, params) => {
  const url = isFunction(baseURL) ? baseURL() : baseURL
  let p = url + obj._resourcePath

  if (obj._parent && obj._parent._singleUUID) {
    p += obj._parent._singleUUID + '/'
    obj._parent._singleUUID = null
  } else if (obj._singleUUID) {
    p += obj._singleUUID + '/'
    obj._singleUUID = null
  }

  if (obj._subPath) {
    p += obj._subPath
  }
  if (uuid) {
    if (isString(uuid)) {
      p += uuid + '/'
    } else if (isNumber(uuid)) {
      p += uuid.toString() + '/'
    }
  }
  if (params && isObject(params)) {
    let index = 0
    forEach(params, function (value, key) {
      const letter = (index === 0) ? '?' : '&'
      p += letter + key + '=' + value
      index += 1
    })
  }
  return p
}

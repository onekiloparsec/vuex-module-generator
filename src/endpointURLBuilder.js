import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'
import forEach from 'lodash/forEach'

export const makeURLBuilder = (baseURL, resourcePath) => (uuid, params) => {
  const url = isFunction(baseURL) ? baseURL() : baseURL
  let p = url + resourcePath

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

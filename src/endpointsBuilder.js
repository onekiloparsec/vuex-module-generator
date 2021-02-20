import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isNumber from 'lodash/isNumber'
import forEach from 'lodash/forEach'

// Create an object fully set up to make HTTP requests to a REST endpoint.
// Start with obj = makeAPIEndpoint(...). Then, obj.get(), obj.put() etc work.

const makeAPIEndpoint = ({ http, baseURL, resourcePath, subPath, parent }) => {
  // if (http == null) {
  //   throw Error('Missing http module to make requests!')
  // }
  if (baseURL == null) {
    throw Error('Missing baseURL!')
  }
  if (resourcePath == null) {
    throw Error('Missing resourcePath!')
  }

  const obj = {
    _http: http,
    _resourcePath: resourcePath,
    _singleUUID: null,
    _subPath: subPath || null,
    _parent: parent || null,

    url: (uuid, params) => {
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
    },

    get: (uuid, params) => obj._http.get(obj.url(uuid, params)),
    options: (uuid) => obj._http.options(obj.url(uuid)),
    post: (data) => obj._http.post(obj.url(), data),
    put: (uuid, data) => obj._http.put(obj.url(uuid), data),
    patch: (uuid, data) => obj._http.patch(obj.url(uuid), data),
    delete: (uuid) => obj._http.delete(obj.url(uuid))
  }

  obj.subresource = (subpath) => {
    return makeAPIEndpoint({
      http: obj._http,
      baseURL: baseURL,
      resourcePath: obj._resourcePath,
      subPath: subpath,
      parent: obj
    })
  }

  obj.addSubresource = (subpath) => {
    obj[subpath.slice(0, -1)] = makeAPIEndpoint({
      http: obj._http,
      baseURL: baseURL,
      resourcePath: obj._resourcePath,
      subPath: subpath,
      parent: obj
    })
    return obj
  }

  obj.single = (uuid) => {
    obj._singleUUID = uuid
    return obj
  }

  return obj
}

export { makeAPIEndpoint }
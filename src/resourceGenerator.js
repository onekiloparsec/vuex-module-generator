import _ from 'lodash'

export const makeAPIPoint = ({ http, baseURL, resourcePath, subPath, parent }) => {
  if (http == null) {
    throw Error('Missing http module to make requests!')
  }
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
      const url = _.isFunction(baseURL) ? baseURL() : baseURL
      let p = url + obj._resourcePath
      if (obj._parent && obj._parent._singleUUID) {
        p += obj._parent._singleUUID + '/'
      } else if (obj._singleUUID) {
        p += obj._singleUUID + '/'
      }
      if (obj._subPath) {
        p += obj._subPath
      }
      if (uuid) {
        if (_.isString(uuid)) {
          p += uuid + '/'
        } else if (_.isNumber(uuid)) {
          p += uuid.toString() + '/'
        }
      }
      if (params && _.isObject(params)) {
        let index = 0
        _.forEach(params, function (value, key) {
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
    delete: (uuid) => obj._http.delete(obj.url(uuid))
  }

  obj.subresource = (subpath) => {
    return makeAPIPoint({
      http: obj._http,
      baseURL: baseURL,
      resourcePath: obj._resourcePath,
      subPath: subpath,
      parent: obj
    })
  }

  obj.addSubresource = (subpath) => {
    obj[subpath.slice(0, -1)] = makeAPIPoint({
      http: obj._http,
      baseURL: baseURL,
      resourcePath: obj._resourcePath,
      subPath: subpath,
      parent: obj
    })
    return obj
  }

  obj.single = (uuid) => {
    const clonedObj = _.cloneDeep(obj)
    clonedObj._singleUUID = uuid
    return clonedObj
  }

  return obj
}

export default { makeAPIPoint }

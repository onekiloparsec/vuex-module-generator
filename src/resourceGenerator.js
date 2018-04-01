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

    url: (uuid) => {
      let p = baseURL + obj._resourcePath
      if (obj._parent && obj._parent._singleUUID) {
        p += obj._parent._singleUUID + '/'
      }
      if (obj._subPath) {
        p += obj._subPath
      }
      if (uuid) {
        if (_.isString(uuid)) {
          p += uuid + '/'
        } else if (_.isNumber(uuid)) {
          p += uuid.toString() + '/'
        } else if (_.isObject(uuid)) {
          let index = 0
          _.forEach(uuid, function (value, key) {
            const letter = (index === 0) ? '?' : '&'
            p += letter + key + '=' + value
            index += 1
          })
        }
      }
      return p
    },

    get: (uuid) => obj._http.get(obj.url(uuid)),
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
    obj._singleUUID = uuid
    return obj
  }

  return obj
}

export default { makeAPIPoint }

import _ from 'lodash'
import axios from 'axios'

export const makeResource = (API_URL, basePath, subPath = null, parent = null) => {
  const obj = {
    _basePath: basePath,
    _singleUUID: null,
    _subPath: subPath,
    _parent: parent,

    url: (uuid) => {
      let p = API_URL + obj._basePath
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

    get: (uuid) => axios.get(obj.url(uuid)),
    options: (uuid) => axios.options(obj.url(uuid)),
    post: (data) => axios.post(obj.url(), data),
    put: (uuid, data) => axios.put(obj.url(uuid), data),
    delete: (uuid) => axios.delete(obj.url(uuid))
  }

  obj.subresource = (subpath) => {
    return makeResource(API_URL, obj._basePath, subpath, obj)
  }

  obj.addSubresource = (subpath) => {
    obj[subpath.slice(0, -1)] = makeResource(API_URL, obj._basePath, subpath, obj)
    return obj
  }

  obj.single = (uuid) => {
    obj._singleUUID = uuid
    return obj
  }

  return obj
}

export default {
  makeResource
}

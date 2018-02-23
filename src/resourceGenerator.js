import Vue from 'vue'
import _ from 'lodash'

import config from './config'

export const makeResource = (basePath, subPath = null, parent = null) => {
  const obj = {
    _basePath: basePath,
    _singleUUID: null,
    _subPath: subPath,
    _parent: parent,

    url: (uuid) => {
      let p = config.API_URL + obj._basePath
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

    get: (uuid) => Vue.http.get(obj.url(uuid)),
    options: (uuid) => Vue.http.options(obj.url(uuid)),
    post: (data) => Vue.http.post(obj.url(), data),
    put: (uuid, data) => Vue.http.put(obj.url(uuid), data),
    delete: (uuid) => Vue.http.delete(obj.url(uuid))
  }

  obj.subresource = (subpath) => {
    return makeResource(obj._basePath, subpath, obj)
  }

  obj.addSubresource = (subpath) => {
    obj[subpath.slice(0, -1)] = makeResource(obj._basePath, subpath, obj)
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

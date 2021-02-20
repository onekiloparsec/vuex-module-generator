import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isNumber from 'lodash/isNumber'
import forEach from 'lodash/forEach'
import isNil from 'lodash/isNil'
import { TREE_PARENT_ID } from './moduleGenerator'

// Create an object fully set up to make HTTP requests to a REST endpoint.
// Start with obj = makeAPIEndpoint(...). Then, obj.get(), obj.put() etc work.

const makeAPIEndpoint = ({ http, baseURL, resourcePath, idKey, subPath, parent }) => {
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

    _get: (uuid, params) => obj._http.get(obj.url(uuid, params)),
    _options: (uuid) => obj._http.options(obj.url(uuid)),
    _post: (data) => obj._http.post(obj.url(), data),
    _put: (uuid, data) => obj._http.put(obj.url(uuid), data),
    _patch: (uuid, data) => obj._http.patch(obj.url(uuid), data),
    _delete: (uuid) => obj._http.delete(obj.url(uuid)),

    list: (obj) => isString(obj) ? this._get(obj, null) : this._get(null, obj),

    // The presence of TREE_PARENT_ID decides whether one add a child to a tree, or simply an item to a list
    create: (obj) => isNil(obj[TREE_PARENT_ID]) ? this._post(obj) : this.subresource(obj[TREE_PARENT_ID].toString() + '/').post(obj['data']),

    read: (obj) => this._get(obj.toString()), // obj is assumed to be a id string.
    swap: (obj) => this._put(obj[idKey].toString(), obj['data']), // obj is assumed to be an object, inside which we have an id, and a data payload.
    update: (obj) => this._patch(obj[idKey].toString(), obj['data']), // obj is assumed to be an object, inside which we have an id, and a data payload.
    delete: (obj) => this._delete(obj.toString()), // // idOrData is assumed to be a id.

    pages: (obj, notifyCallback, prefix = '') => {
      return new Promise(async (resolve, reject) => {
        let [page, total, results, keepGoing, maxPage] = [1, 1, [], true, 0]

        // Be careful, checking for idOrData['maxPage'] will return false when maxPage = 0
        if (obj && 'maxPage' in obj) {
          maxPage = obj['maxPage'] || 0
          delete obj['maxPage']
          if (Object.keys(obj).length === 0) {
            obj = undefined
          }
        }

        if (notifyCallback) {
          notifyCallback(prefix + 'Pending', obj)
        }

        while (keepGoing) {
          let response
          try {
            // Doing the actual fetch request to API endpoint
            response = await this._get(null, { ...obj, page: page })
          } catch (error) {
            keepGoing = false
            if (notifyCallback) {
              notifyCallback(prefix + 'Failure', error)
            }
            reject(error)
            return
          }

          const data = response.body || response.data
          if (page === 1) {
            total = Math.ceil(data.count / data.results.length)
          }
          results.push(...data.results)
          if (notifyCallback) {
            notifyCallback(prefix + 'PartialSuccess', { data: data.results.map(item => Object.freeze(item)), page, total })
          }

          if (!data.next || (maxPage > 0 && page === maxPage)) {
            keepGoing = false
          } else {
            page += 1
          }
        }

        if (notifyCallback) {
          notifyCallback(prefix + 'Success', results.map(item => Object.freeze(item)))
        }
        resolve(results)
      })
    }
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

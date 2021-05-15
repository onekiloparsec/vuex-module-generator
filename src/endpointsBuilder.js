import isString from 'lodash/isString'
import isNil from 'lodash/isNil'
import { TREE_PARENT_ID } from './moduleGenerator'
import { makeURLBuilder } from '@/urlBuilder'

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

  let obj = {
    _http: http,
    _resourcePath: resourcePath,
    _singleUUID: null,
    _subPath: subPath || null,
    _parent: parent || null,
  }

  obj.url = makeURLBuilder(obj, baseURL)

  obj = { ...obj,
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

  obj.single = (uuid) => {
    obj._singleUUID = uuid
    return obj
  }

  return obj
}

export { makeAPIEndpoint }

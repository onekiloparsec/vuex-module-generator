import { makeURLBuilder } from './endpointURLBuilder'

// Create an object fully set up to make HTTP requests to a REST endpoint.
// Start with obj = buildAPIEndpoint(...). Then, obj.get(), obj.put() etc work.
// WARNING: the list(), create(), read() etc methods MUST have only ONE argument.

export const buildAPIEndpoint = ({ http, baseURL, resourcePath, idKey, subPath, parent }) => {
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
    _parent: parent || null
  }

  obj.url = makeURLBuilder(obj, baseURL)

  obj = {
    ...obj,
    _get: (uuid, params) => obj._http.get(obj.url(uuid, params)),
    _options: (uuid) => obj._http.options(obj.url(uuid)),
    _post: (data) => obj._http.post(obj.url(), data),
    _put: (uuid, data) => obj._http.put(obj.url(uuid), data),
    _patch: (uuid, data) => obj._http.patch(obj.url(uuid), data),
    _delete: (uuid) => obj._http.delete(obj.url(uuid)),

    list: (obj) => this._get(null, obj),
    create: (obj) => this._post(obj),
    read: (obj) => this._get(obj.toString(), null), // obj is assumed to be a id string.
    swap: (obj) => this._put(obj[idKey].toString(), obj['data']), // obj is assumed to be an object, inside which we have an id, and a data payload.
    update: (obj) => this._patch(obj[idKey].toString(), obj['data']), // obj is assumed to be an object, inside which we have an id, and a data payload.
    delete: (obj) => this._delete(obj.toString()) // // idOrData is assumed to be a id.
  }

  obj.subresource = (subpath) => {
    return buildAPIEndpoint({
      http: obj._http,
      baseURL: baseURL,
      resourcePath: obj._resourcePath,
      subPath: subpath,
      parent: obj
    })
  }

  // Deprecated. Allow to use things like api.observingsites.single(<uuid>).images.list()...
  // when a subresource 'images/' has been added to the object.
  obj.addSubresource = (subpath) => {
    obj[subpath.slice(0, -1)] = buildAPIEndpoint({
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

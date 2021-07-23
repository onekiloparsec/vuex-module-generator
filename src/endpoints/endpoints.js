import { makeURLBuilder } from './endpointURLs'

// Create an object fully set up to make HTTP requests to a REST endpoint.
// Start with obj = buildAPIEndpoint(...). Then, obj.get(), obj.put() etc work.
// WARNING: the list(), create(), read() etc methods MUST have only ONE argument.

export const buildAPIEndpoint = (http, baseURL, resourcePath, idKey, subPath = '', parent = null) => {
  if (http == null) {
    throw Error('Missing http module to make requests!')
  }
  if (baseURL == null) {
    throw Error('Missing baseURL!')
  }
  if (resourcePath == null) {
    throw Error('Missing resourcePath!')
  }
  if (idKey == null) {
    throw Error('Missing idKey!')
  }

  const endpoint = {
    _http: http,
    _baseURL: baseURL,
    _resourcePath: resourcePath,
    _subPath: subPath,
    _idKey: idKey,
    _parent: parent
  }

  endpoint.url = makeURLBuilder({ baseURL, resourcePath, subPath, parent })

  // l
  endpoint.list = (params) => endpoint._http.get(endpoint.url(null, params))
  // c
  endpoint.create = (data) => endpoint._http.post(endpoint.url(), data)
  // r
  endpoint.read = (id) => endpoint._http.get(endpoint.url(id.toString(), null))
  // u
  endpoint.update = (obj) => endpoint._http.patch(endpoint.url(obj[endpoint._idKey].toString()), obj['data'])
  // s
  endpoint.swap = (obj) => endpoint._http.put(endpoint.url(obj[endpoint._idKey].toString()), obj['data'])
  // d
  endpoint.delete = (id) => endpoint._http.delete(endpoint.url(id.toString()))

  endpoint.options = (_id) => endpoint._http.options(endpoint.url(_id))

  // Deprecated. Allow to use things like api.observingsites.single(<_id>).images.list()...
  // when a subresource 'images/' has been added to the object.
  endpoint.addSubresource = (subPath, subIdKey) => {
    endpoint[subPath.slice(0, -1)] = buildAPIEndpoint(
      endpoint._http,
      endpoint._baseURL,
      endpoint._resourcePath,
      subIdKey,
      subPath,
      endpoint
    )
    return endpoint
  }

  endpoint.single = (_id) => {
    endpoint._singleResourceId = _id
    return endpoint
  }

  return endpoint
}

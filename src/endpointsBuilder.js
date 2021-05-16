import { makeURLBuilder } from './endpointURLBuilder'

// Create an object fully set up to make HTTP requests to a REST endpoint.
// Start with obj = buildAPIEndpoint(...). Then, obj.get(), obj.put() etc work.
// WARNING: the list(), create(), read() etc methods MUST have only ONE argument.

export const buildAPIEndpoint = (http, baseURL, resourcePath, idKey, parent = null) => {
  if (http == null) {
    throw Error('Missing http module to make requests!')
  }
  if (resourcePath == null) {
    throw Error('Missing resourcePath!')
  }

  const endpoint = {
    _http: http,
    _baseURL: baseURL,
    _resourcePath: resourcePath,
    _parent: parent
  }

  endpoint.url = makeURLBuilder(baseURL, resourcePath, parent)

  endpoint.list = (params) => endpoint._http.get(endpoint.url(null, params))
  endpoint.create = (data) => endpoint._http.post(endpoint.url(), data)
  endpoint.read = (id) => endpoint._http.get(endpoint.url(id.toString(), null))
  endpoint.swap = (obj) => endpoint._http.put(endpoint.url(obj[idKey].toString()), obj['data'])
  endpoint.update = (obj) => endpoint._http.patch(endpoint.url(obj[idKey].toString()), obj['data'])
  endpoint.delete = (id) => endpoint._http.delete(endpoint.url(id.toString()))

  endpoint.options = (_id) => endpoint._http.options(endpoint.url(_id))

  // Deprecated. Allow to use things like api.observingsites.single(<_id>).images.list()...
  // when a subresource 'images/' has been added to the object.
  endpoint.addSubresource = (subPath, subIdKey) => {
    endpoint[subPath.slice(0, -1)] = buildAPIEndpoint(
      endpoint._http,
      endpoint._baseURL + endpoint._resourcePath,
      subPath,
      subIdKey,
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

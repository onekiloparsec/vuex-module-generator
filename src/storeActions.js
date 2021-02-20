import { makeDefaultFetchPromise, makePagedFetchPromise } from './fetchPromises'

export const makeDefaultStoreAction = (mutationName, crudRequest) => ({ commit }, idOrData) => {
  return makeDefaultFetchPromise(mutationName, crudRequest, commit, idOrData)
}

export const makePagedStoreAction = (mutationName, crudRequest) => ({ commit }, idOrData) => {
  return makePagedFetchPromise(mutationName, crudRequest, commit, idOrData)
}

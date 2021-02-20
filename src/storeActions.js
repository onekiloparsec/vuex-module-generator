import { makeDefaultFetchPromise, makePagedFetchPromise } from './fetchPromises'

export const makeDefaultStoreAction = (mutationName, apiAction) => ({ commit }, idOrData) => {
  return makeDefaultFetchPromise(mutationName, apiAction, commit, idOrData)
}

export const makePagedStoreAction = (mutationName, apiAction) => ({ commit }, idOrData) => {
  return makePagedFetchPromise(mutationName, apiAction, commit, idOrData)
}

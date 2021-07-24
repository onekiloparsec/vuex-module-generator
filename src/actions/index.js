import { getActionsNames } from './names'
import { makeDefaultFetchPromise, makePagedFetchPromise } from './promises'
import { getCrudMutationNames } from '@/mutations'
import { getActivatedActionKeys } from '@/utils'

const makeDefaultStoreAction = (mutationName, endpointMethodFunc) => ({ commit }, idOrData) => {
  return makeDefaultFetchPromise(mutationName, endpointMethodFunc, commit, idOrData)
}

const makePagedStoreAction = (mutationName, endpointMethodFunc) => ({ commit }, idOrData) => {
  return makePagedFetchPromise(mutationName, endpointMethodFunc, commit, idOrData)
}

export const getActionsObject = (endpoint, root, lcrusd, subresources) => {
  subresources = subresources || []
  const actionNames = getActionsNames(root, subresources)
  const crudMutationNames = getCrudMutationNames(root)
  const activatedActionKeys = getActivatedActionKeys(lcrusd)

  const actions = {}

  // Create default actions for all activated action names defined by lcrusd.
  activatedActionKeys.forEach(actionKey => {
    const mutationName = crudMutationNames[actionKey]
    actions[actionNames[actionKey]] = makeDefaultStoreAction(mutationName, endpoint[actionKey])
  })

  // Paged List API Action: replace list with true paged-list workflow (with a list/GET request).
  if (lcrusd.includes('p')) {
    // If we add 'p' to the lcrusd parameter, whatever the presence of an 'l', we override
    // the list action by the paged-list one.
    const actionName = 'list'
    const mutationName = crudMutationNames[actionName]
    actions[actionNames[actionName]] = makePagedStoreAction(mutationName, endpoint[actionName])
  }

  for (let i = 0; i < subresources.length; i++) {
    actions[actionNames.readSubresources[i]] = makeDefaultStoreAction('update')
  }

  return actions
}

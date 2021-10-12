import { getStateObject } from '@/state'
import { getGettersObject } from '@/getters'
import { getMutationsObject } from '@/mutations'
import { buildAPIEndpoint } from '@/endpoints'
import { getActionsObject } from '@/actions'

const makeStoreModule = ({ rootName, idKey, multiSelection = false }) => {
  const state = getStateObject(rootName, multiSelection)
  const getters = getGettersObject(rootName, idKey)

  const storeModule = { namespaced: true, state, getters }

  storeModule.generateActions = ({ http, baseURL, resourcePath, lcrusd, subresourcePaths = [] }) => {
    let _endpoint = buildAPIEndpoint({ http, baseURL, resourcePath, idKey })

    for (let subPath of subresourcePaths || []) {
      _endpoint = _endpoint.addSubresource(subPath, 'pk')
    }

    const mutations = getMutationsObject(rootName, idKey, lcrusd, multiSelection)
    const actions = getActionsObject(_endpoint, rootName, lcrusd, subresourcePaths)

    // Include the _endpoint object inside the module to play using the endpoint directly.
    Object.assign(storeModule, { mutations, actions, _endpoint })

    return storeModule
  }

  storeModule.attachCustomGetters = (customGetters) => {
    Object.assign(getters, customGetters || {})
    return storeModule
  }

  return storeModule
}

export default { buildAPIEndpoint, makeStoreModule }

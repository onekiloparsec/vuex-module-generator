import { getStateObject } from '@/state'
import { getGettersObject } from '@/getters'
import { getMutationsObject } from '@/mutations'
import { buildAPIEndpoint } from '@/endpoints'
import { getActionsObject } from '@/actions'

const makeStoreModule = ({ rootName, idKey, multiSelection = false }) => {
  const state = getStateObject(rootName)
  const getters = getGettersObject(rootName, idKey)

  const storeModule = { namespaced: true, state, getters }

  storeModule.attachCustomGetters = (customGetters) => {
    Object.assign(getters, customGetters || {})
    return storeModule
  }

  storeModule.generateActions = ({ http, baseURL, resourcePath, lcrusd, subresourcePaths = [] }) => {
    let _endpoint = buildAPIEndpoint({ http, baseURL, resourcePath, idKey })

    for (let subPath of subresourcePaths || []) {
      _endpoint = _endpoint.addSubresource(subPath, 'pk')
    }

    const mutations = getMutationsObject(rootName, idKey, multiSelection, lcrusd)
    const actions = getActionsObject(_endpoint, rootName, lcrusd, subresourcePaths)

    Object.assign(storeModule, { mutations, actions, _endpoint })

    return storeModule
  }

  return storeModule
}

export default makeStoreModule

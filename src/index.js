import { getStateObject } from '@/state'
import { getGettersObject } from '@/getters'
import { getMutationsObject } from '@/mutations'
import { buildAPIEndpoint } from '@/endpoints'
import { getActionsObject } from '@/actions'
export const makeStoreModule = (basicParams) => {
  const state = getStateObject(basicParams.rootName)
  const getters = getGettersObject(basicParams.rootName, basicParams.idKey)
  const storeModule = { namespaced: true, state, getters }
  storeModule.attachCustomGetters = (customGetters = {}) => {
    Object.assign(getters, customGetters || {})
    return storeModule
  }
  storeModule.generateActions = (actionsParams) => {
    let _endpoint = buildAPIEndpoint({
      http: actionsParams.http,
      baseURL: actionsParams.baseURL,
      resourcePath: actionsParams.resourcePath,
      idKey: basicParams.idKey
    })
    for (let subPath of actionsParams.subresourcePaths || []) {
      // @ts-ignore
      _endpoint = _endpoint.addSubresource(subPath, 'pk')
    }
    const multiSelection = basicParams.multiSelection || false
    const mutations = getMutationsObject(basicParams.rootName, basicParams.idKey, multiSelection, actionsParams.lcrusd)
    const actions = getActionsObject(_endpoint, basicParams.rootName, actionsParams.lcrusd, actionsParams.subresourcePaths)
    Object.assign(storeModule, { mutations, actions, _endpoint })
    return storeModule
  }
  return storeModule
}
// # sourceMappingURL=index.js.map

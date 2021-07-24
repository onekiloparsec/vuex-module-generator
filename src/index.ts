import { getStateObject } from '@/state'
import { getGettersObject } from '@/getters'
import { getMutationsObject } from '@/mutations'
import { buildAPIEndpoint } from '@/endpoints'
import { getActionsObject } from '@/actions'

export type BasicStoreModuleParams = {
  rootName: string,
  idKey: string,
  multiSelection: boolean
}

export type ActionsStoreModuleParams = {
  http: Object,
  baseURL: string,
  lcrusd: string,
  resourcePath: string,
  subresourcePaths?: string[]
}

export type VuexModule = {
  namespaced: boolean,
  state: Object,
  getters: Object,
  mutations?: Object,
  actions?: Object,
  _endpoint?: Object,
  attachCustomGetters?: Function,
  generateActions?: Function
}

export const makeStoreModule = (basicParams: BasicStoreModuleParams): VuexModule => {
  const state = getStateObject(basicParams.rootName)
  const getters = getGettersObject(basicParams.rootName, basicParams.idKey)

  const storeModule: VuexModule = { namespaced: true, state, getters }

  storeModule.attachCustomGetters = (customGetters: Object = {}) => {
    Object.assign(getters, customGetters || {})
    return storeModule
  }

  storeModule.generateActions = (actionsParams: ActionsStoreModuleParams) => {
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

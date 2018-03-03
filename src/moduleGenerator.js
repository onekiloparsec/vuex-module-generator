import _ from 'lodash'
import Vue from 'vue'

import { makeResource } from './resourceGenerator'
import { createModuleNames, recurseDown, mutationSuccessRUD } from './utils'

export const TREE_PARENT_ID = 'tree_parent_id'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
const createMutationSuccesses = (listName, selectionName, singleSelectionName, idKey) => ({
  list: (state, itemsList) => {
    // list is list, no need of idOrData here.
    state[listName] = itemsList
    // filter out items that are not known anymore.
    // do not use IDs! objects may have changed
    state[selectionName] = state[selectionName].filter(item => itemsList.includes(item))
    // also clear single selection if necessary
    if (itemsList.includes(state[singleSelectionName]) === false) {
      state[singleSelectionName] = null
    }
  },
  create: (state, obj, idOrData) => {
    if (state.__allowTree__) {
      // obj is newly created object.
      // idOrData is an object containing:
      // -- the data with which obj has been created, and
      // -- the TREE_PARENT_ID to attach to. TREE_PARENT_ID *must* be present.
      recurseDown(state[listName], idOrData[TREE_PARENT_ID], (arr, id) => {
        const index = _.findIndex(arr, item => item[idKey] === id)
        if (index !== -1) {
          arr.push(obj)
          return false
        }
      })
      // Using Vue.set() to ensure reactivity when changing a nested array
      Vue.set(state, listName, new Array(...state[listName]))
      // state[listName] = new Array(...state[listName])
    } else {
      state[listName] = _.concat(state[listName], obj)
    }
  },
  read: (state, obj) => {
    mutationSuccessRUD(state, listName, selectionName, idKey, obj[idKey], (list, index) => {
      if (state[singleSelectionName] === list[index]) {
        state[singleSelectionName] = obj
      }
      list.splice(index, 1, obj)
    })
    Vue.set(state, listName, new Array(...state[listName]))
  },
  update: (state, obj) => {
    mutationSuccessRUD(state, listName, selectionName, idKey, obj[idKey], (list, index) => {
      if (state[singleSelectionName] === list[index]) {
        state[singleSelectionName] = obj
      }
      list.splice(index, 1, obj)
    })
    Vue.set(state, listName, new Array(...state[listName]))
  },
  delete: (state, id) => {
    mutationSuccessRUD(state, listName, selectionName, idKey, id, (list, index) => {
      if (state[singleSelectionName] === list[index]) {
        state[singleSelectionName] = null
      }
      list.splice(index, 1)
    })
    Vue.set(state, listName, new Array(...state[listName]))
  }
})

const createApiActions = (api, idKey, dataKey) => ({
  list: (obj) => api.get(obj), // obj is assumed to be an object. Used a URL parameters.
  create: (obj) => {
    // Here the presence of TREE_PARENT_ID decides whether one add a child to a tree, or simply an item to a list
    if (_.isNil(obj[TREE_PARENT_ID])) {
      return api.post(obj) // obj is assumed to be an object. Used as new Object properties
    } else {
      return api.subresource(obj[TREE_PARENT_ID].toString() + '/').post(obj[dataKey])
    }
  },
  read: (obj) => api.get(obj.toString()), // obj is assumed to be a id string.
  update: (obj) => api.put(obj[idKey].toString(), obj[dataKey]), // obj is assumed to be an object, inside which we have an id, and a data payload.
  delete: (obj) => api.delete(obj.toString()) // // idOrData is assumed to be a id.
})

function makeModule (apiURL, apiPath, root, idKey, allowTree, allowMultipleSelection, lcrud) {
  const api = makeResource(apiURL, apiPath)
  const apiActions = createApiActions(api, idKey, 'data')

  const names = createModuleNames(root)

  const mutationSuccesses = createMutationSuccesses(names.state.list, names.state.selection, names.state.singleSelection, idKey)
  const actionNames = ['list', 'create', 'read', 'update', 'delete'] // lcrud
  const boolActionNames = ['list', 'create']
  const defaultActionStates = [false, false, null, null, null]

  /* ------------ Vuex Elements ------------ */

  const state = {}
  const getters = {}
  const mutations = {}
  const actions = {}

  /* ------------ Vuex State ------------ */

  state.__allowTree__ = allowTree
  state.__allowMultipleSelection__ = allowMultipleSelection

  state[names.state.list] = []
  state[names.state.crud] = _.zipObject(actionNames, defaultActionStates)

  state[names.state.selection] = []
  state[names.state.singleSelection] = null

  /* ------------ Vuex Getters ------------ */

  getters[names.getters.isSelected] = (state) => (selectedItem) => {
    return (_.findIndex(state[names.state.selection], item => item === selectedItem) !== -1)
  }

  /* ------------ Vuex Mutations ------------ */

  _.forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    _.merge(mutations, {
      [names.mutations.crud[actionName].PENDING] (state, idOrData) {
        state[names.state.crud][actionName] = (boolActionNames.includes(actionName)) ? true : idOrData
      },
      [names.mutations.crud[actionName].SUCCESS] (state, obj, idOrData) {
        mutationSuccesses[actionName](state, obj, idOrData)
        state[names.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      },
      [names.mutations.crud[actionName].FAILURE] (state) {
        state[names.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      }
    })
  })

  // Non-(L)CRUD mutations :

  mutations[names.mutations.select] = (state, selectedItem) => {
    if (selectedItem) {
      if (state.__allowMultipleSelection__) {
        state[names.state.selection] = _.uniq(_.concat(state[names.state.selection], selectedItem))
      } else {
        state[names.state.singleSelection] = selectedItem
        state[names.state.selection] = _.concat([], selectedItem)
      }
    }
  }

  mutations['de' + names.mutations.select] = (state, selectedItem) => {
    if (selectedItem) {
      const index = _.findIndex(state[names.state.selection], item => item === selectedItem)
      if (index !== -1) {
        state[names.state.selection].splice(index, 1)
      }
      if (state[names.state.singleSelection] === selectedItem) {
        state[names.state.singleSelection] = null
      }
    }
  }

  mutations[names.mutations.clearSelection] = (state) => {
    state[names.state.selection] = []
    state[names.state.singleSelection] = null
  }

  mutations[names.mutations.updateList] = (state, newList) => {
    state[names.state.list] = newList
  }

  /* ------------ Vuex Actions ------------ */

  _.forEach(actionNames, (actionName) => {
    if (lcrud.includes(actionName.charAt(0))) {
      actions[names.actions[actionName]] = ({ commit }, idOrData) => {
        return new Promise((resolve, reject) => {
          commit(names.mutations.crud[actionName].PENDING, idOrData)
          apiActions[actionName](idOrData)
            .then(
              response => {
                if (actionName === 'delete') { // De-select on delete
                  commit('de' + names.mutations.select, obj)
                }
                const obj = response.body || response.data
                commit(names.mutations.crud[actionName].SUCCESS, obj, idOrData)
                resolve(obj)
              },
              error => {
                commit(names.mutations.crud[actionName].FAILURE, error)
                reject(error)
              }
            )
        })
      }
    }
  })

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}

function makeListModule (apiURL, apiPath, baseName, idKey, allowMultipleSelection, lcrud = 'lcrud') {
  return makeModule(apiURL, apiPath, baseName, idKey, false, allowMultipleSelection, lcrud)
}

function makeTreeModule (apiURL, apiPath, baseName, idKey, allowMultipleSelection, lcrud = 'lcrud') {
  return makeModule(apiURL, apiPath, baseName, idKey, true, allowMultipleSelection, lcrud)
}

export {
  makeListModule,
  makeTreeModule,
  makeModule
}

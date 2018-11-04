import _ from 'lodash'
import Vue from 'vue'

import { makeAPIPoint } from './resourceGenerator'
import { createModuleNames, mutationsSuccessRUD, recurseDown } from './utils'

export const TREE_PARENT_ID = 'tree_parent_id'

// idKey is a string such as 'pk', or 'uuid' or 'identifier' etc.
const createMutationSuccesses = (listName, selectionName, singleSelectionName, idKey) => ({
  list: (state, itemsList) => {
    // list is list, no need of idOrData here.
    state[listName] = itemsList
    // filter out items that are not known anymore. do not use IDs! objects may have changed
    state[selectionName] = state[selectionName].filter(item => itemsList.includes(item))
    // also clear single selection if necessary
    if (itemsList && itemsList.includes(state[singleSelectionName]) === false) {
      state[singleSelectionName] = null
    }
  },

  // CREATE mutation will append object to list.
  create: (state, obj) => {
    if (state.__allowTree__) {
      // obj is the newly created object.
      // idOrData is the POST request payload object containing:
      // -- the data with which obj has been created, and
      // -- the TREE_PARENT_ID to attach to. TREE_PARENT_ID *must* be present.
      recurseDown(state[listName], obj[TREE_PARENT_ID], (arr, id) => {
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

  // READ mutation will update the object if it exists already, or push it inside list if not yet present.
  read: (state, obj) => {
    mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, obj[idKey],
      (listCursor, selectionCursor, updateSingleSelection) => {
        if (listCursor !== null) {
          listCursor.list.splice(listCursor.index, 1, obj)
        } else {
          state[listName].push(obj)
        }
        Vue.set(state, listName, new Array(...state[listName]))

        if (selectionCursor !== null) {
          selectionCursor.list.splice(selectionCursor.index, 1, obj)
          Vue.set(state, selectionName, new Array(...state[selectionName]))
        }

        if (updateSingleSelection) {
          state[singleSelectionName] = obj
        }
      })
  },

  // UPDATE mutation will do the same as READ
  update: (state, obj) => {
    mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, obj[idKey],
      (listCursor, selectionCursor, updateSingleSelection) => {
        if (listCursor !== null) {
          listCursor.list.splice(listCursor.index, 1, obj)
        } else {
          state[listName].push(obj)
        }
        Vue.set(state, listName, new Array(...state[listName]))

        if (selectionCursor !== null) {
          selectionCursor.list.splice(selectionCursor.index, 1, obj)
          Vue.set(state, selectionName, new Array(...state[selectionName]))
        }

        if (updateSingleSelection) {
          state[singleSelectionName] = obj
        }
      })
  },

  // DELETE mutation will...
  delete: (state, objID) => {
    mutationsSuccessRUD(state[listName], state[selectionName], state[singleSelectionName], idKey, objID,
      (listCursor, selectionCursor, updateSingleSelection) => {
        if (listCursor !== null) {
          listCursor.list.splice(listCursor.index, 1)
          Vue.set(state, listName, new Array(...state[listName]))
        }

        if (selectionCursor !== null) {
          selectionCursor.list.splice(selectionCursor.index, 1)
          Vue.set(state, selectionName, new Array(...state[selectionName]))
        }

        if (updateSingleSelection) {
          state[singleSelectionName] = null
        }
      })
  }
})

const createApiActions = (api, idKey, dataKey) => ({
  list: (obj) => {
    if (_.isString(obj)) {
      return api.get(obj, null) // obj as complement of list endpoint path
    } else {
      return api.get(null, obj) // obj is used a URL parameters.
    }
  },
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

function makeModule ({ http, apiURL, apiPath, root, idKey, allowTree, allowMultipleSelection, lcrud, customGetters }) {
  customGetters = customGetters || {}
  const api = makeAPIPoint({ http: http, baseURL: apiURL, resourcePath: apiPath })
  const apiActions = createApiActions(api, idKey, 'data')

  const names = createModuleNames(root)

  const mutationSuccesses = createMutationSuccesses(names.state.list, names.state.selection, names.state.singleSelection, idKey)
  const actionNames = ['list', 'create', 'read', 'update', 'delete'] // lcrud
  const boolActionNames = ['list', 'create']
  const defaultActionStates = [false, false, null, null, null]

  /* ------------ Vuex Elements ------------ */

  const state = {}
  var getters = {}
  const mutations = {}
  const actions = {}

  /* ------------ Vuex State ------------ */

  state.__allowTree__ = allowTree || false
  state.__allowMultipleSelection__ = allowMultipleSelection || false

  state[names.state.list] = []
  state[names.state.crud] = _.zipObject(actionNames, defaultActionStates)

  state[names.state.selection] = []
  state[names.state.singleSelection] = null

  /* ------------ Vuex Getters ------------ */

  getters[names.getters.isSelected] = (state) => (selectedItem) => {
    return (_.findIndex(state[names.state.selection], item => item === selectedItem) !== -1)
  }

  getters = _.assign(getters, customGetters)

  /* ------------ Vuex Mutations ------------ */

  _.forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    _.merge(mutations, {
      [names.mutations.crud[actionName].PENDING] (state, payload) {
        // payload is only idOrData
        state[names.state.crud][actionName] = (boolActionNames.includes(actionName)) ? true : payload
      },
      [names.mutations.crud[actionName].SUCCESS] (state, payload) {
        mutationSuccesses[actionName](state, payload)
        state[names.state.crud][actionName] = (boolActionNames.includes(actionName)) ? false : null
      },
      [names.mutations.crud[actionName].FAILURE] (state, payload) {
        // payload is only error object
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
            .then(response => {
              const payload = response.body || response.data
              commit(names.mutations.crud[actionName].SUCCESS, payload)
              resolve(payload)
            })
            .catch(error => {
              commit(names.mutations.crud[actionName].FAILURE, error)
              reject(error)
            })
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

export { makeModule }

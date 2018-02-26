import Vue from 'vue'
import _ from 'lodash'

export const TREE_PARENT_ID = 'tree_parent_id'

const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const createAsyncMutation = (type) => ({
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`
})

export const createMutationNames = (listNameUppercase) => ({
  list: createAsyncMutation(`${listNameUppercase}_LIST_FETCH`),
  create: createAsyncMutation(`${listNameUppercase}_SINGLE_CREATE`),
  read: createAsyncMutation(`${listNameUppercase}_SINGLE_READ`),
  update: createAsyncMutation(`${listNameUppercase}_SINGLE_UPDATE`),
  delete: createAsyncMutation(`${listNameUppercase}_SINGLE_DELETE`)
})

const createFuncNames = (word) => ({
  list: `list${word}s`,
  create: `create${word}`,
  read: `read${word}`,
  update: `update${word}`,
  delete: `delete${word}`
})

const recurseDown = (array, pk, iteratee) => {
  let res
  res = iteratee(array, pk)
  if (res !== false) {
    _.each(array, (node) => {
      if (res !== false && !_.isNil(node['children'])) {
        res = recurseDown(node['children'], pk, iteratee)
      }
      return res
    })
  }
  return res
}

const createMutationSuccesses = (listName, selectName, idKey) => ({
  list: (state, obj, idOrData) => {
    state[listName] = obj
  },
  create: (state, obj) => {
    if (state.__allowTree__ && state[selectName]) {
      // Using Vue.set() to ensure reactivity when changing a nested array
      Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj))
    } else {
      state[listName] = _.concat(state[listName], obj)
    }
  },
  read: (state, obj, idOrData) => {
    if (state.__allowTree__ && state[selectName]) {
      recurseDown(state[listName], obj[idKey], (a, pk) => {
        const index = _.findIndex(a, item => item[idKey] === pk)
        if (index !== -1) {
          a.splice(index, 1, obj)
          return false
        }
        state[listName] = new Array(...state[listName])
      })
    } else {
      const currentIndex = _.findIndex(state[listName], item => item[idKey] === obj[idKey])
      if (currentIndex !== -1) {
        state[listName].splice(currentIndex, 1, obj)
      }
    }
  },
  update: (state, obj, idOrData) => {
    if (state.__allowTree__) {
      if (state[selectName]) {
        Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj))
      } else {
        state[listName] = new Array(...state[listName])
      }
    } else {
      const index = _.findIndex(state[listName], item => item[idKey] === obj[idKey])
      if (index !== -1) {
        state[listName].splice(index, 1, obj)
      }
    }
  },
  delete: (state, obj, idOrData) => {
    if (state.__allowTree__) {
      recurseDown(state[listName], obj[idKey], (a, pk) => {
        const index = _.findIndex(a, item => item[idKey] === pk)
        if (index !== -1) {
          a.splice(index, 1)
          return false
        }
      })
      state[listName] = new Array(...state[listName])
    } else {
      state[listName] = state[listName].filter(item => item[idKey] !== obj)
    }
  }
})

const createApiActions = (api, idKey, dataKey) => ({
  list: (obj) => api.get(obj), // obj is assumed to be an object. Used a URL parameters.
  create: (obj) => {
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

function makeModule (allowTree, api, root, idKey, lcrud) {
  const dataKey = 'data'
  const baseName = root.toLowerCase()
  const word = capitalizeFirstChar(baseName)

  const listName = `${baseName}s`
  const crudName = `${baseName}Crud`
  const selectName = `selected${word}s`

  const mutationNames = createMutationNames(listName.toUpperCase())
  const mutationSuccesses = createMutationSuccesses(listName, selectName, idKey)

  // other mutations
  const selectionMutationName = `select${word}`
  const selectionSingleMutationName = `selectSingle${word}`
  const ableMultipleSelectionMutationName = `ableMultiple${word}sSelection`
  const clearSelectionMutationName = `clear${word}sSelection`
  const updateListMutationName = `update${word}sList`

  const actionNames = ['list', 'create', 'read', 'update', 'delete'] // lcrud
  const defaultActionStates = [false, false, null, null, null]
  const actionFuncNames = createFuncNames(word)
  const apiActions = createApiActions(api, idKey, dataKey)

  /* ------------ Vuex------------ */

  const state = {}
  const getters = {}
  const mutations = {}
  const actions = {}

  /* ------------ State ------------ */

  state.__allowTree__ = allowTree
  state.multipleSelection = false
  state[listName] = []
  state[crudName] = _.zipObject(actionNames, defaultActionStates)
  state[selectName] = []

  /* ------------ Getters ------------ */

  getters['isSelected'] = (state) => (selectedItem) => {
    return (_.findIndex(state[selectName], item => item === selectedItem) !== -1)
  }

  /* ------------ Mutations ------------ */

  _.forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    const boolActionNames = ['list', 'create']
    _.merge(mutations, {
      [mutationNames[actionName].PENDING] (state, idOrData) {
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? true : idOrData
      },
      [mutationNames[actionName].SUCCESS] (state, obj, idOrData) {
        mutationSuccesses[actionName](state, obj, idOrData)
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? false : null
      },
      [mutationNames[actionName].FAILURE] (state) {
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? false : null
      }
    })
  })

  // Non-(L)CRUD mutations :

  mutations[selectionMutationName] = (state, selectedItem) => {
    if (selectedItem) {
      if (state.multipleSelection) {
        state[selectName] = _.uniq(_.concat(state[selectName], selectedItem))
      } else {
        state[selectName] = _.concat([], selectedItem)
      }
    }
  }

  mutations[selectionSingleMutationName] = (state, selectedItem) => {
    if (selectedItem) {
      state[selectName] = _.concat([], selectedItem)
    }
  }

  mutations['de' + selectionMutationName] = (state, selectedItem) => {
    if (selectedItem) {
      const index = _.findIndex(state[selectName], item => item === selectedItem)
      if (index !== -1) {
        state[selectName].splice(index, 1)
      }
    }
  }

  mutations['en' + ableMultipleSelectionMutationName] = (state) => {
    state.multipleSelection = true
  }

  mutations['dis' + ableMultipleSelectionMutationName] = (state) => {
    state.multipleSelection = false
  }

  mutations[clearSelectionMutationName] = (state) => {
    state[selectName] = []
  }

  mutations[updateListMutationName] = (state, newList) => {
    state[listName] = newList
  }

  /* ------------ Actions ------------ */

  _.forEach(actionNames, (actionName) => {
    if (lcrud.includes(actionName.charAt(0))) {
      actions[actionFuncNames[actionName]] = ({ commit }, idOrData) => {
        return new Promise((resolve, reject) => {
          commit(mutationNames[actionName].PENDING, idOrData)
          apiActions[actionName](idOrData)
            .then(
              response => {
                const obj = response.body || response.data
                commit(mutationNames[actionName].SUCCESS, obj, idOrData)
                resolve(obj)
              },
              error => {
                commit(mutationNames[actionName].FAILURE, error)
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

function makeListModule (api, baseName, idKey, lcrud = 'lcrud') {
  return makeModule(false, api, baseName, idKey, lcrud)
}

function makeTreeModule (api, baseName, idKey, lcrud = 'lcrud') {
  return makeModule(true, api, baseName, idKey, lcrud)
}

export {
  makeListModule,
  makeTreeModule,
  makeModule
}
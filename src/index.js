import Vue from 'vue'
import _ from 'lodash'

export const TREE_PARENT_ID = 'tree_parent_id'

const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const createAsyncMutation = (type) => ({
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`
})

const createMutationNames = (listNameUppercase) => ({
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
    if (state.allowTree && state[selectName]) {
      Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj))
    } else {
      state[listName] = _.concat(state[listName], obj)
    }
  },
  read: (state, obj, idOrData) => {
    if (state.allowTree && state[selectName]) {
    } else {
      const currentIndex = _.findIndex(state[listName], item => item[idKey] === obj[idKey])
      if (currentIndex !== -1) {
        state[listName].splice(currentIndex, 1, obj)
      }
    }
  },
  update: (state, obj, idOrData) => {
    if (state.allowTree) {
      if (state[selectName]) {

      } else {
        Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj))
      }
    } else {
      const index = _.findIndex(state[listName], item => item[idKey] === obj[idKey])
      if (index !== -1) {
        state[listName].splice(index, 1, obj)
      }
    }
  },
  delete: (state, obj, idOrData) => {
    if (state.allowTree) {
      recurseDown(state[listName], obj[idKey], (a, pk) => {
        const index = _.findIndex(a, item => item[idKey] === pk)
        if (index !== -1) {
          a.splice(index, 1)
          return false
        }
      })
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
  read: (obj) => api.get(obj), // obj is assumed to be a id string.
  update: (obj) => api.put(obj[idKey], obj[dataKey]), // obj is assumed to be an object, inside wihch we have an id, and a data payload.
  delete: (obj) => api.delete(obj) // // idOrData is assumed to be a id string.
})

function makeModule (allowTree, api, root, idKey, lcrud) {
  const dataKey = 'data'
  const baseName = root.toLowerCase()
  const word = capitalizeFirstChar(baseName)

  const listName = `${baseName}s`
  const crudName = `${baseName}Crud`
  const selectName = `selected${word}`

  const mutationNames = createMutationNames(listName.toUpperCase())
  const selectMutationName = `select${word}`
  const changeNameMutationName = `changeSelected${word}Name`
  const mutationSuccesses = createMutationSuccesses(listName, selectName, idKey)

  const actionNames = ['list', 'create', 'read', 'update', 'delete'] // lcrud
  const defaultActionStates = [false, false, false, false, false]
  const actionFuncNames = createFuncNames(word)
  const apiActions = createApiActions(api, idKey, dataKey)

  /* ------------ Vuex------------ */

  const state = {}
  const getters = {}
  const mutations = {}
  const actions = {}

  /* ------------ State ------------ */

  state.allowTree = allowTree
  state[listName] = []
  state[crudName] = _.zipObject(actionNames, defaultActionStates)
  state[selectName] = null

  /* ------------ Getters ------------ */
  /* ------------ Mutations ------------ */

  _.forEach(actionNames.filter(a => lcrud.includes(a.charAt(0))), actionName => {
    _.merge(mutations, {
      [mutationNames[actionName].PENDING] (state) {
        state[crudName][actionName] = true
      },
        state[crudName][actionName] = false
      [mutationNames[actionName].SUCCESS] (state, obj, idOrData) {
        mutationSuccesses[actionName](state, obj, idOrData)
      },
      [mutationNames[actionName].FAILURE] (state) {
        state[crudName][actionName] = false
      }
    })
  })

  // Non-(L)CRUD mutations :

  mutations[selectMutationName] = (state, selectedItem) => {
    state[selectName] = selectedItem
  }

  mutations['de' + selectMutationName] = (state) => {
    state[selectName] = null
  }

  mutations[changeNameMutationName] = (state, newName) => {
    state[selectName].name = newName
  }

  /* ------------ Actions ------------ */

  _.forEach(actionNames, (actionName) => {
    if (lcrud.includes(actionName.charAt(0))) {
      actions[actionFuncNames[actionName]] = ({ commit }, idOrData) => {
        return new Promise((resolve, reject) => {
          commit(mutationNames[actionName].PENDING)
          apiActions[actionName](idOrData).then(
            response => {
              const obj = response.body || response.data
              commit(mutationNames[actionName].SUCCESS, obj, idOrData)
              resolve(obj)
            },
            error => {
              commit(mutationNames[actionName].FAILURE)
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
  makeTreeModule
}

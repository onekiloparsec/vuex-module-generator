/*!
 * vuex-arcsecond-module-generator v0.2.2
 * (c) 2018 Cédric Foellmi
 * Released under the MIT License.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var _ = _interopDefault(require('lodash'));

var TREE_PARENT_ID = 'tree_parent_id';

var capitalizeFirstChar = function (str) { return str.charAt(0).toUpperCase() + str.substring(1); };

var createAsyncMutation = function (type) { return ({
  SUCCESS: (type + "_SUCCESS"),
  FAILURE: (type + "_FAILURE"),
  PENDING: (type + "_PENDING")
}); };

var createMutationNames = function (listNameUppercase) { return ({
  list: createAsyncMutation((listNameUppercase + "_LIST_FETCH")),
  create: createAsyncMutation((listNameUppercase + "_SINGLE_CREATE")),
  read: createAsyncMutation((listNameUppercase + "_SINGLE_READ")),
  update: createAsyncMutation((listNameUppercase + "_SINGLE_UPDATE")),
  delete: createAsyncMutation((listNameUppercase + "_SINGLE_DELETE"))
}); };

var createFuncNames = function (word) { return ({
  list: ("list" + word + "s"),
  create: ("create" + word),
  read: ("read" + word),
  update: ("update" + word),
  delete: ("delete" + word)
}); };

var recurseDown = function (array, pk, iteratee) {
  var res;
  res = iteratee(array, pk);
  if (res !== false) {
    _.each(array, function (node) {
      if (res !== false && !_.isNil(node['children'])) {
        res = recurseDown(node['children'], pk, iteratee);
      }
      return res
    });
  }
  return res
};

var createMutationSuccesses = function (listName, selectName, idKey) { return ({
  list: function (state, obj, idOrData) {
    state[listName] = obj;
  },
  create: function (state, obj) {
    if (state.allowTree && state[selectName]) {
      Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj));
    } else {
      state[listName] = _.concat(state[listName], obj);
    }
  },
  read: function (state, obj, idOrData) {
    if (state.allowTree && state[selectName]) {
    } else {
      var currentIndex = _.findIndex(state[listName], function (item) { return item[idKey] === obj[idKey]; });
      if (currentIndex !== -1) {
        state[listName].splice(currentIndex, 1, obj);
      }
    }
  },
  update: function (state, obj, idOrData) {
    if (state.allowTree) {
      if (state[selectName]) {

      } else {
        Vue.set(state[selectName], 'children', _.concat(state[selectName]['children'] || [], obj));
      }
    } else {
      var index = _.findIndex(state[listName], function (item) { return item[idKey] === obj[idKey]; });
      if (index !== -1) {
        state[listName].splice(index, 1, obj);
      }
    }
  },
  delete: function (state, obj, idOrData) {
    if (state.allowTree) {
      recurseDown(state[listName], obj[idKey], function (a, pk) {
        var index = _.findIndex(a, function (item) { return item[idKey] === pk; });
        if (index !== -1) {
          a.splice(index, 1);
          return false
        }
      });
    } else {
      state[listName] = state[listName].filter(function (item) { return item[idKey] !== obj; });
    }
  }
}); };

var createApiActions = function (api, idKey, dataKey) { return ({
  list: function (obj) { return api.get(obj); }, // obj is assumed to be an object. Used a URL parameters.
  create: function (obj) {
    if (_.isNil(obj[TREE_PARENT_ID])) {
      return api.post(obj) // obj is assumed to be an object. Used as new Object properties
    } else {
      return api.subresource(obj[TREE_PARENT_ID].toString() + '/').post(obj[dataKey])
    }
  },
  read: function (obj) { return api.get(obj); }, // obj is assumed to be a id string.
  update: function (obj) { return api.put(obj[idKey], obj[dataKey]); }, // obj is assumed to be an object, inside wihch we have an id, and a data payload.
  delete: function (obj) { return api.delete(obj); } // // idOrData is assumed to be a id string.
}); };

function makeModule (allowTree, api, root, idKey, lcrud) {
  var dataKey = 'data';
  var baseName = root.toLowerCase();
  var word = capitalizeFirstChar(baseName);

  var listName = baseName + "s";
  var crudName = baseName + "Crud";
  var selectName = "selected" + word;

  var mutationNames = createMutationNames(listName.toUpperCase());
  var selectMutationName = "select" + word;
  var changeNameMutationName = "changeSelected" + word + "Name";
  var mutationSuccesses = createMutationSuccesses(listName, selectName, idKey);

  var actionNames = ['list', 'create', 'read', 'update', 'delete']; // lcrud
  var defaultActionStates = [false, false, null, null, null];
  var actionFuncNames = createFuncNames(word);
  var apiActions = createApiActions(api, idKey, dataKey);

  /* ------------ Vuex------------ */

  var state = {};
  var getters = {};
  var mutations = {};
  var actions = {};

  /* ------------ State ------------ */

  state.allowTree = allowTree;
  state[listName] = [];
  state[crudName] = _.zipObject(actionNames, defaultActionStates);
  state[selectName] = null;

  /* ------------ Getters ------------ */
  /* ------------ Mutations ------------ */

  _.forEach(actionNames.filter(function (a) { return lcrud.includes(a.charAt(0)); }), function (actionName) {
    var boolActionNames = ['list', 'create'];
    _.merge(mutations, ( obj = {}, obj[mutationNames[actionName].PENDING] = function (state, idOrData) {
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? true : idOrData;
      }, obj[mutationNames[actionName].SUCCESS] = function (state, obj, idOrData) {
        mutationSuccesses[actionName](state, obj, idOrData);
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? false : null;
      }, obj[mutationNames[actionName].FAILURE] = function (state) {
        state[crudName][actionName] = (boolActionNames.includes(actionName)) ? false : null;
      }, obj ));
    var obj;
  });

  // Non-(L)CRUD mutations :

  mutations[selectMutationName] = function (state, selectedItem) {
    state[selectName] = selectedItem;
  };

  mutations['de' + selectMutationName] = function (state) {
    state[selectName] = null;
  };

  mutations[changeNameMutationName] = function (state, newName) {
    state[selectName].name = newName;
  };

  /* ------------ Actions ------------ */

  _.forEach(actionNames, function (actionName) {
    if (lcrud.includes(actionName.charAt(0))) {
      actions[actionFuncNames[actionName]] = function (ref, idOrData) {
        var commit = ref.commit;

        return new Promise(function (resolve, reject) {
          commit(mutationNames[actionName].PENDING, idOrData);
          apiActions[actionName](idOrData).then(
            function (response) {
              var obj = response.body || response.data;
              commit(mutationNames[actionName].SUCCESS, obj, idOrData);
              resolve(obj);
            },
            function (error) {
              commit(mutationNames[actionName].FAILURE);
              reject(error);
            }
          );
        })
      };
    }
  });

  return {
    namespaced: true,
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
  }
}

function makeListModule (api, baseName, idKey, lcrud) {
  if ( lcrud === void 0 ) lcrud = 'lcrud';

  return makeModule(false, api, baseName, idKey, lcrud)
}

function makeTreeModule (api, baseName, idKey, lcrud) {
  if ( lcrud === void 0 ) lcrud = 'lcrud';

  return makeModule(true, api, baseName, idKey, lcrud)
}

exports.TREE_PARENT_ID = TREE_PARENT_ID;
exports.createAsyncMutation = createAsyncMutation;
exports.makeListModule = makeListModule;
exports.makeTreeModule = makeTreeModule;
export const makeDefaultAction = (mutationsCrud, actionName, apiActions) => ({ commit }, idOrData) => {
  return new Promise((resolve, reject) => {
    // Committing mutation of pending state for current action
    commit(mutationsCrud[actionName] + 'Pending', idOrData)

    // Doing the actual fetch request to API endpoint
    apiActions[actionName](idOrData)
      .then(response => {
        // Committing mutation of success state for current action
        const payload = response.body || response.data
        commit(mutationsCrud[actionName] + 'Success', payload)
        resolve(payload)
      })
      .catch(error => {
        // Committing mutation of failure state for current action
        commit(mutationsCrud[actionName] + 'Failure', error)
        reject(error)
      })
  })
}

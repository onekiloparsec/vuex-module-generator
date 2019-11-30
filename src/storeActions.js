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

export const makePagedAPIAction = (mutationCrudList, listApiAction) => ({ commit }, idOrData) => {
  let page = 1
  let total = 1
  let results = []

  return new Promise(async (resolve, reject) => {
    // Committing mutation of pending state for current action
    commit(mutationCrudList + 'Pending')

    let keepGoing = true
    while (keepGoing) {
      let response
      try {
        // Doing the actual fetch request to API endpoint
        response = await listApiAction({ ...idOrData, page: page })
      } catch (error) {
        keepGoing = false
        commit(mutationCrudList + 'Failure', error)
        reject(error)
      }

      const payload = response.body || response.data
      if (page === 1) {
        total = Math.ceil(payload.count / payload.results.length)
      }
      results.push(...payload.results)
      commit(mutationCrudList + 'PartialSuccess', { payload: payload.results, page, total })

      if (payload.next) {
        page += 1
      } else {
        keepGoing = false
      }
    }

    commit(mutationCrudList + 'Success', results)
    resolve(results)
  })
}

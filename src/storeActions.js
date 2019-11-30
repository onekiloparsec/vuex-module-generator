export const makeDefaultAction = (mutationName, apiAction) => ({ commit }, idOrData) => {
  return new Promise((resolve, reject) => {
    // Committing mutation of pending state for current action
    commit(mutationName + 'Pending', idOrData)

    // Doing the actual fetch request to API endpoint
    apiAction(idOrData)
      .then(response => {
        // Committing mutation of success state for current action
        const payload = response.body || response.data
        commit(mutationName + 'Success', payload)
        resolve(payload)
      })
      .catch(error => {
        // Committing mutation of failure state for current action
        commit(mutationName + 'Failure', error)
        reject(error)
      })
  })
}

export const makePagedAPIAction = (mutationName, apiAction) => ({ commit }, idOrData) => {
  return new Promise(async (resolve, reject) => {
    // Committing mutation of pending state for current action
    commit(mutationName + 'Pending', idOrData)

    let page = 1
    let total = 1
    let results = []
    let keepGoing = true

    while (keepGoing) {
      let response
      try {
        // Doing the actual fetch request to API endpoint
        response = await apiAction({ ...idOrData, page: page })
      } catch (error) {
        keepGoing = false
        commit(mutationName + 'Failure', error)
        reject(error)
      }

      const payload = response.body || response.data
      if (page === 1) {
        total = Math.ceil(payload.count / payload.results.length)
      }
      results.push(...payload.results)
      commit(mutationName + 'PartialSuccess', { payload: payload.results, page, total })

      if (payload.next) {
        page += 1
      } else {
        keepGoing = false
      }
    }

    commit(mutationName + 'Success', results)
    resolve(results)
  })
}

import isArray from 'lodash/isArray'

export const makeDefaultAction = (mutationName, apiAction) => ({ commit }, idOrData) => {
  return new Promise((resolve, reject) => {
    // Committing mutation of pending state for current action
    commit(mutationName + 'Pending', idOrData)

    const deleteId = mutationName.startsWith('delete') ? idOrData : null
    // Doing the actual fetch request to API endpoint
    apiAction(idOrData)
      .then(response => {
        // Committing mutation of success state for current action
        const payload = response.body || response.data
        if (isArray(payload)) {
          commit(mutationName + 'Success', payload.map(item => Object.freeze(item)))
        } else {
          commit(mutationName + 'Success', payload ? Object.freeze(payload) : deleteId)
        }
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
    let page = 1
    let total = 1
    let results = []
    let keepGoing = true

    let maxPage = 0
    // Be careful, checking for idOrData['maxPage'] will return false when maxPage = 0
    if (idOrData && 'maxPage' in idOrData) {
      maxPage = idOrData['maxPage'] || 0
      delete idOrData['maxPage']
      if (Object.keys(idOrData).length === 0) {
        idOrData = undefined
      }
    }

    // Committing mutation of pending state for current action
    commit(mutationName + 'Pending', idOrData)

    while (keepGoing) {
      let response
      try {
        // Doing the actual fetch request to API endpoint
        response = await apiAction({ ...idOrData, page: page })
      } catch (error) {
        keepGoing = false
        commit(mutationName + 'Failure', error)
        reject(error)
        return
      }

      const payload = response.body || response.data
      if (page === 1) {
        total = Math.ceil(payload.count / payload.results.length)
      }
      results.push(...payload.results)
      commit(mutationName + 'PartialSuccess', { payload: payload.results.map(item => Object.freeze(item)), page, total })

      if (!payload.next || (maxPage > 0 && page === maxPage)) {
        keepGoing = false
      } else {
        page += 1
      }
    }

    commit(mutationName + 'Success', results.map(item => Object.freeze(item)))
    resolve(results)
  })
}

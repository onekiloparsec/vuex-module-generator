import isArray from 'lodash/isArray'

export const makeDefaultFetchPromise = function (mutationName, crudRequest, notifyCallback, idOrData) {
  return new Promise(async (resolve, reject) => {
    // Committing mutation of pending state for current action
    notifyCallback(mutationName + 'Pending', idOrData)
    const deleteId = mutationName.startsWith('delete') ? idOrData : null
    try {
      // Doing the actual fetch request to API endpoint
      const response = await crudRequest(idOrData)
      // Committing mutation of success state for current action
      const payload = response.body || response.data
      if (isArray(payload)) {
        notifyCallback(mutationName + 'Success', payload.map(item => Object.freeze(item)))
      } else {
        notifyCallback(mutationName + 'Success', payload ? Object.freeze(payload) : deleteId)
      }
      resolve(payload)
    } catch (error) {
      // Committing mutation of failure state for current action
      notifyCallback(mutationName + 'Failure', error)
      reject(error)
    }
  })
}

export const makePagedFetchPromise = function (mutationName, crudRequest, notifyCallback, idOrData) {
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
    notifyCallback(mutationName + 'Pending', idOrData)

    while (keepGoing) {
      let response
      try {
        // Doing the actual fetch request to API endpoint
        response = await crudRequest({ ...idOrData, page: page })
      } catch (error) {
        keepGoing = false
        notifyCallback(mutationName + 'Failure', error)
        reject(error)
        return
      }

      const data = response.body || response.data
      if (page === 1) {
        total = Math.ceil(data.count / data.results.length)
      }
      results.push(...data.results)
      notifyCallback(mutationName + 'PartialSuccess', { data: data.results.map(item => Object.freeze(item)), page, total })

      if (!data.next || (maxPage > 0 && page === maxPage)) {
        keepGoing = false
      } else {
        page += 1
      }
    }

    notifyCallback(mutationName + 'Success', results.map(item => Object.freeze(item)))
    resolve(results)
  })
}

export const makeDefaultFetchPromise = function (mutationName, endpointMethodFunc, notifyCallback, idOrData) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    // Committing mutation of pending state for current action
    notifyCallback(mutationName + 'Pending', idOrData)
    const deleteId = mutationName.startsWith('delete') ? idOrData : null
    try {
      // Doing the actual fetch request to API endpoint
      const response = await endpointMethodFunc(idOrData)
      // Committing mutation of success state for current action
      const data = response.body || response.data
      if (Array.isArray(data)) {
        notifyCallback(mutationName + 'Success', data.map(item => Object.freeze(item)))
      } else {
        notifyCallback(mutationName + 'Success', data ? Object.freeze(data) : deleteId)
      }
      resolve(data)
    } catch (error) {
      // Committing mutation of failure state for current action
      notifyCallback(mutationName + 'Failure', error)
      reject(error)
    }
  })
}

export const makePagedFetchPromise = function (mutationName, endpointListMethodFunc, notifyCallback, idOrData) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let [pageSize, totalCount, pageCurrent, pageTotal, results, keepGoing, maxPage] = [10, 0, 1, 1, [], true, 0]

    // Be careful, checking for idOrData['maxPage'] will return false when maxPage = 0
    if (idOrData && 'maxPage' in idOrData) {
      maxPage = idOrData['maxPage'] || 0
      delete idOrData['maxPage']
      if (Object.keys(idOrData).length === 0) {
        idOrData = undefined
      }
    }

    if (notifyCallback) {
      notifyCallback(mutationName + 'Pending', idOrData)
    }

    while (keepGoing) {
      let response
      try {
        // Doing the actual fetch request to API endpoint
        response = await endpointListMethodFunc({ ...idOrData, page: pageCurrent })
      } catch (error) {
        keepGoing = false
        if (notifyCallback) {
          notifyCallback(mutationName + 'Failure', error)
        }
        reject(error)
        return
      }

      const data = response.body || response.data
      if (page === 1) {
        totalCount = data.count
        pageSize = data.results.length
        pageTotal = Math.ceil(data.count / data.results.length)
      }
      results.push(...data.results)
      if (notifyCallback) {
        const payload = {
          data: data.results.map(item => Object.freeze(item)),
          pageSize,
          totalCount,
          pageCurrent,
          pageTotal
        }
        notifyCallback(mutationName + 'PartialSuccess', payload)
      }

      if (!data.next || (maxPage > 0 && pageCurrent === maxPage)) {
        keepGoing = false
      } else {
        pageCurrent += 1
      }
    }

    if (notifyCallback) {
      notifyCallback(mutationName + 'Success', results.map(item => Object.freeze(item)))
    }
    resolve(results)
  })
}

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

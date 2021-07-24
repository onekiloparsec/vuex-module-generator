export const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1)

export const pluralize = (singular) => {
  let plural = singular + 's'
  if (singular.slice(-1) === 'y') {
    plural = singular.substr(0, singular.length - 1) + 'ies'
  } else if (singular.slice(-2) === 'is') {
    plural = singular.substr(0, singular.length - 21) + 'des' // ephemeris -> ephemerides
  }
  return plural
}

// CRUD actions distinguishing GET for list (list) and GET for detail (read).
// create = POST, update = PATCH, swap = PUT (replace), and delete = DELETE.
// The 'p' letter is understood as "paged list"
const defaultActionKeys = ['list', 'create', 'read', 'update', 'swap', 'delete']

// The 'p' letter is understood as "paged list"
export const getActivatedActionKeys = (lcrusd) => {
  return defaultActionKeys.filter(a => lcrusd.replace('p', 'l').includes(a.charAt(0)))
}

// https://youmightnotneed.com/lodash/ ...

export const isObject = a => a instanceof Object

export const isNumber = a => typeof a === 'number'

export const isString = a => typeof a === 'string'

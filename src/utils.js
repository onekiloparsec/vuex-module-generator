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

let API_PROTOCOL = ''
let API_HOSTNAME = ''
let API_PORT = ''

// URL and endpoint constants
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
  API_PROTOCOL = 'http'
  API_HOSTNAME = 'api.lvh.me'
  API_PORT = '8000'
} else if (process.env.NODE_ENV === 'staging') {
  API_PROTOCOL = 'https'
  API_HOSTNAME = 'arcsecond-back-staging.herokuapp.com'
} else {
  API_PROTOCOL = 'https'
  API_HOSTNAME = 'api.arcsecond.io'
}

const API_URL = API_PROTOCOL + '://' + API_HOSTNAME + ((API_PORT !== '') ? ':' + API_PORT : '') + '/'
const LOGIN_URL = API_URL + 'auth-token/'
const SIGNUP_URL = API_URL + 'auth/registration/'
const VERIFY_EMAIL_URL = API_URL + 'auth/registration/verify-email/'
const RESET_PASSWORD_URL = API_URL + 'auth/password/reset/'
const RESET_PASSWORD_CONFIRM_URL = API_URL + 'auth/password/reset/confirm/'
const CHANGE_PASSWORD_URL = API_URL + 'auth/password/change/'
const LOGOUT_URL = API_URL + 'auth/logout/'

export default {
  API_PROTOCOL,
  API_HOSTNAME,
  API_PORT,
  API_URL,
  LOGIN_URL,
  SIGNUP_URL,
  VERIFY_EMAIL_URL,
  RESET_PASSWORD_URL,
  RESET_PASSWORD_CONFIRM_URL,
  CHANGE_PASSWORD_URL,
  LOGOUT_URL
}


import { get, intersection } from 'lodash'
import stelace from './stelace'

// Use this synchronous function to know if the current user is authenticated
// without a network request
// e.g. to display login modal for unauthenticated users when they arrive in the app
export function getCurrentUserId () {
  const { userId } = stelace.auth.info()
  return userId
}

export function getAuthToken () {
  const tokenStore = stelace.getTokenStore()
  const tokens = tokenStore.getTokens()

  return tokens && tokens.accessToken
}

export function shouldAuthenticateAsOrg (user, config) {
  return !!intersection(
    user.roles,
    get(config, 'stelace.instant.shouldAuthenticateAsOrg') || []
  ).length
}

export function getOrganizationIdFromLocalStorage () {
  if (typeof window === 'object') {
    return window.localStorage.getItem('stelaceOrganizationId')
  }
}

export function setOrganizationIdInLocalStorage (organizationId) {
  if (typeof window === 'object') {
    window.localStorage.setItem('stelaceOrganizationId', organizationId)
  }
}

export function removeOrganizationIdInLocalStorage () {
  if (typeof window === 'object') {
    window.localStorage.removeItem('stelaceOrganizationId')
  }
}

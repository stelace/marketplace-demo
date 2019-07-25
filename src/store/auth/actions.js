import stelace from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'
import { sortBy } from 'lodash'
import * as api from './api'

import {
  getCurrentUserId,
  shouldAuthenticateAsOrg,
  getOrganizationIdFromLocalStorage,
  setOrganizationIdInLocalStorage,
  removeOrganizationIdInLocalStorage
} from 'src/utils/auth'

export async function fetchCurrentUser ({ commit, dispatch, state, rootState, rootGetters }, { forceRefresh = false } = {}) {
  // only fetch current user data in browser environment
  // because the authentication tokens are stored in local storage
  // so they aren't available in server-side
  const isBrowser = typeof window === 'object'
  if (!isBrowser) return

  const currentUser = state.user || {}
  const naturalUser = state.naturalUser || {}
  const userId = getCurrentUserId()

  if (!forceRefresh && naturalUser.id === userId) return currentUser

  if (userId) {
    try {
      const {
        naturalUser,
        organizations
      } = await api.fetchCurrentUserWithOrganizations(userId)

      commit({
        type: types.SET_NATURAL_USER,
        user: naturalUser
      })
      commit({
        type: types.SET_ORGANIZATIONS,
        organizations
      })

      // fetch config here instead on relying on rootGetters (race condition)
      const config = await dispatch('fetchConfig')

      const authenticateAsOrg = shouldAuthenticateAsOrg(naturalUser, config)

      if (!authenticateAsOrg) {
        commit({
          type: types.SET_CURRENT_USER,
          user: naturalUser
        })
        return
      }

      const firstOrg = sortBy(organizations, org => org.createdDate)[0]

      const selectedOrganizationId = getOrganizationIdFromLocalStorage()
      const selectedOrg = selectedOrganizationId
        ? organizations.find(org => org.id === selectedOrganizationId)
        : null

      if (selectedOrg || firstOrg) {
        let organizationId
        if (selectedOrg) {
          organizationId = selectedOrg.id
        } else {
          organizationId = firstOrg.id
        }

        await dispatch('selectOrganization', { organizationId })
      } else {
        commit({
          type: types.SET_CURRENT_USER,
          user: naturalUser
        })
      }
    } catch (err) {
      commit({
        type: types.SET_CURRENT_USER,
        user: null
      })
      commit({
        type: types.SET_NATURAL_USER,
        user: null
      })
      commit({
        type: types.SET_ORGANIZATIONS,
        organizations: []
      })

      // the current user no longer exists, so we remove the auth token
      if (err.statusCode === 404) {
        const tokenStore = stelace.getTokenStore()
        tokenStore.removeTokens()
      } else {
        throw err
      }
    }
  } else {
    commit({
      type: types.SET_CURRENT_USER,
      user: null
    })
    commit({
      type: types.SET_NATURAL_USER,
      user: null
    })
    commit({
      type: types.SET_ORGANIZATIONS,
      organizations: []
    })
  }
}

export function selectNaturalUser ({ state, commit }) {
  const user = state.naturalUser
  if (!user) return

  commit({
    type: types.SET_CURRENT_USER,
    user
  })

  stelace.setOrganizationId(null)
}

export function selectOrganization ({ state, commit }, { organizationId }) {
  const organization = state.organizationsById[organizationId]
  if (!organization) return

  commit({
    type: types.SET_CURRENT_USER,
    user: organization
  })

  stelace.setOrganizationId(organizationId)
  setOrganizationIdInLocalStorage(organizationId)
}

export async function login ({ dispatch }, { username, password }) {
  await stelace.auth.login({
    username,
    password
  })

  await dispatch('fetchCurrentUser')
}

export async function getAuthTokensAndUser ({ dispatch }, { code }) {
  await stelace.auth.getTokens({
    grantType: 'authorizationCode',
    code
  })

  await dispatch('fetchCurrentUser')
}

export async function signup ({ commit, dispatch }, { userAttrs, noLogin = false }) {
  await stelace.users.create(userAttrs)

  // add timeout to background operations to be completed on the new user
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (noLogin) return

  const { username, password } = userAttrs

  await stelace.auth.login({
    username,
    password
  })

  await dispatch('fetchCurrentUser')

  commit({
    type: types.SET_IS_NEW_USER,
    isNewUser: true
  })
}

export async function logout ({ commit }, { sessionExpired = false } = {}) {
  if (!sessionExpired) await stelace.auth.logout()
  stelace.setOrganizationId(null)
  removeOrganizationIdInLocalStorage()

  commit({
    type: types.SET_CURRENT_USER,
    user: null
  })
  commit({
    type: types.SET_NATURAL_USER,
    user: null
  })
  commit({
    type: types.SET_ORGANIZATIONS,
    organizations: []
  })
  commit({
    type: types.SET_IS_NEW_USER,
    isNewUser: false
  })
}

export async function sendResetPasswordRequest ({ commit }, { username }) {
  await stelace.password.resetRequest({ username })
}

export async function sendResetPasswordConfirmation ({ commit }, { resetToken, newPassword }) {
  await stelace.password.resetConfirm({ resetToken, newPassword })
}

export async function changePassword ({ commit }, { currentPassword, newPassword }) {
  await stelace.password.change({
    currentPassword,
    newPassword
  })
}

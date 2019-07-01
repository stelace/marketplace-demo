import { isEmpty, isNil, isUndefined, sortBy } from 'lodash'

import { populateUser } from 'src/utils/user'

export function currentUser (state, getters, rootState, rootGetters) {
  const user = Object.assign({}, state.user)

  const { categoriesById } = rootState.common
  const ratingsOptions = rootGetters.ratingsOptions
  const { ratingsStatsByType } = rootState.rating

  if (user.id) {
    populateUser(user, { categoriesById, ratingsOptions, ratingsStatsByType, isCurrentUser: true })
  }

  return user
}

export function currentNaturalUser (state) {
  return state.naturalUser || {}
}

export function isNaturalUser (state, getters) {
  const currentUser = getters.currentUser
  return !isEmpty(currentUser) && currentUser.id === getters.currentNaturalUser.id
}

export function mainOrganization (state, getters, rootState, rootGetters) {
  const mainOrg = rootGetters.currentOrganizations.find(org => !Object.keys(org.organizations).length)
  return mainOrg || {}
}

export function isMainOrganization (state, getters, rootState, rootGetters) {
  const currentUser = getters.currentUser
  const mainOrganization = rootGetters.mainOrganization
  return currentUser.id === mainOrganization.id
}

export function currentOrganizations (state) {
  return sortBy(Object.values(state.organizationsById), org => org.createdDate)
}

export function selectedUserIsCurrentUser (state, getters, rootState, rootGetters) {
  const selectedUser = rootGetters.selectedUser
  const currentUser = rootGetters.currentUser

  return [selectedUser.id, currentUser.id].every(id => !isNil(id)) &&
    selectedUser.id === currentUser.id
}

export function canViewSelectedUserPrivateData (state, getters, rootState, rootGetters) {
  const selectedUser = rootGetters.selectedUser
  const privateFields = ['username', 'firstname', 'lastname', 'email']

  return privateFields.every(field => !isUndefined(selectedUser[field]))
}

export function authDialogActionConfig (state) {
  const action = state.authDialogAction

  const actionConfig = {
    userTypes: ['user', 'provider']
  }

  if (!action) {
    return actionConfig
  }

  if (action === 'subscribeToPlan') {
    actionConfig.userTypes = ['provider']
  } else if (action === 'createAsset') {
    actionConfig.userTypes = ['provider']
  }

  return actionConfig
}

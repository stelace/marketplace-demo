import { get } from 'lodash'

import { populateUser } from 'src/utils/user'

export function selectedUser (state, getters, rootState, rootGetters) {
  const currentUser = rootGetters.currentUser
  const selectedUser = state.selectedUser
  const isCurrentUser = selectedUser.id === currentUser.id
  const user = Object.assign({}, isCurrentUser ? currentUser : selectedUser)

  const ratingsOptions = rootGetters.ratingsOptions
  const {
    ratingsStatsByTargetId,
  } = rootState.rating

  populateUser(user, {
    ratingsOptions,
    ratingsStatsByTargetId,
    isCurrentUser,
  })

  return user
}

export function isSelectedUserNatural (state, getters) {
  const roles = get(getters.selectedUser, 'roles', [])
  return !roles.includes('organization')
}

export function currentUserPosition (state, getters, rootState, rootGetters) {
  const currentUser = rootGetters.currentUser
  const userLocation = state.userLocation

  if (currentUser && currentUser.locations && currentUser.locations.length) {
    return currentUser.locations[0]
  }

  return userLocation
}

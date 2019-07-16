import { get } from 'lodash'

import { populateUser } from 'src/utils/user'

export function selectedUser (state, getters, rootState, rootGetters) {
  const currentUser = rootGetters.currentUser
  const selectedUser = state.selectedUser
  const isCurrentUser = selectedUser.id === currentUser.id
  const user = Object.assign({}, isCurrentUser ? currentUser : selectedUser)

  const ratingsOptions = rootGetters.ratingsOptions
  const {
    ratingsStatsByType,
    nbRecommendations,
    recommendedBy,
  } = rootState.rating

  populateUser(user, {
    ratingsOptions,
    ratingsStatsByType,
    isCurrentUser,
    nbRecommendations,
    recommendedBy,
  })

  return user
}

export function isSelectedUserNatural (state, getters) {
  const roles = get(getters.selectedUser, 'roles', [])
  return !roles.includes('organization')
}

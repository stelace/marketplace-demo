import * as userUtils from 'src/utils/user'

// HELPER FUNCTIONS

export function isProvider (state, getters, rootState, rootGetters) {
  return userUtils.isProvider(rootGetters.currentUser)
}

export function isUser (state, getters, rootState, rootGetters) {
  return userUtils.isUser(rootGetters.currentUser)
}

// ACCESS FUNCTIONS

export function canCreateAsset () {
  return true
}

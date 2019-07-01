import { get, isEmpty } from 'lodash'
import * as userUtils from 'src/utils/user'

// HELPER FUNCTIONS

export function isAccountActive (state, getters, rootState, rootGetters) {
  const accountActive = !!get(rootGetters.currentUser, 'platformData.instant.accountActive')
  return accountActive
}

export function isPremium (state, getters, rootState, rootGetters) {
  const currentUser = rootGetters.currentUser

  const now = new Date().toISOString()

  const roles = get(currentUser, 'roles', [])
  const hasGroupPremium = roles.includes('premium')
  const premiumEndDate = get(currentUser, 'platformData._private.premiumEndDate')

  return hasGroupPremium && now < premiumEndDate
}

export function isNewcomer (state, getters, rootState, rootGetters) {
  const roles = get(rootGetters.currentUser, 'roles', [])
  return roles.includes('newcomer')
}

export function isProvider (state, getters, rootState, rootGetters) {
  return userUtils.isProvider(rootGetters.currentUser)
}

export function isUser (state, getters, rootState, rootGetters) {
  return userUtils.isUser(rootGetters.currentUser)
}

// ACCESS FUNCTIONS

export function canViewCreateAssetCta (state, getters, rootState, rootGetters) {
  return !rootGetters.currentUser.id || rootGetters.isProvider
}

export function canViewUserNames (state, getters, rootState, rootGetters) {
  return rootGetters.isPremium
}

export function canCreateAsset (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider
}

export function canPublishAsset (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && rootGetters.isAccountActive
}

export function canViewAsset (state, getters, rootState, rootGetters) {
  const currentUser = rootGetters.currentUser
  return !!currentUser.id
}

export function canViewBookAssetCta (state, getters, rootState, rootGetters) {
  return rootGetters.isUser
}

export function canBookAsset (state, getters, rootState, rootGetters) {
  return rootGetters.isUser && rootGetters.isAccountActive
}

export function canViewPlanPricing (state, getters, rootState, rootGetters) {
  return !isEmpty(rootGetters.plans) &&
    (!rootGetters.currentUser.id ||
      (rootGetters.isProvider &&
        (rootGetters.isMainOrganization || !!rootGetters.mainOrganization)
      )
    )
}

export function canSubscribeToPlan (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && (rootGetters.isMainOrganization || !!rootGetters.mainOrganization)
}

export function canPerformReverseSearch (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && rootGetters.isPremium && rootGetters.isAccountActive
}

export function canViewUserProfileDetails (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && (rootGetters.isPremium || rootGetters.isNewcomer)
}

export function canViewContactUserCta (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider
}

export function canContactUser (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && rootGetters.isAccountActive && rootGetters.isPremium
}

export function canEditUserAvailability (state, getters, rootState, rootGetters) {
  return rootGetters.isUser
}

export function canRateUser (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider
}

export function canCreateOrganization (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && rootGetters.isAccountActive
}

export function canViewRatingsList (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && rootGetters.isPremium
}

export function canViewRatingsListCta (state, getters, rootState, rootGetters) {
  return rootGetters.isProvider && !rootGetters.isPremium
}

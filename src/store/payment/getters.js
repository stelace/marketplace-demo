import { get } from 'lodash'

import {
  formatPlan,
  getStripeCustomer,
  getStripeCustomerSubscription
} from './utils'

export function plans (state, getters, rootState) {
  const stripePlans = get(rootState.common.config, 'stelace.instant.stripePlans')
  if (!stripePlans) return []

  return stripePlans.reduce((memo, stripePlan) => {
    if (!stripePlan.active) return memo

    const plan = formatPlan(stripePlan)
    memo.push(plan)

    return memo
  }, [])
}

export function currentUserStripeCustomer (state, getters) {
  const currentUser = getters.currentUser
  return getStripeCustomer(currentUser)
}

export function currentUserSubscription (state, getters) {
  const currentUser = getters.currentUser
  return getStripeCustomerSubscription(currentUser)
}

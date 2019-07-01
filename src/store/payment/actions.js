import stelace from 'src/utils/stelace'

export async function createCustomer ({ getters, dispatch }) {
  const currentUser = getters.currentUser

  if (!currentUser) {
    throw new Error('User need to be authenticated')
  }

  const customer = await stelace.providers.stripeRequest({
    url: '/v1/customers',
    method: 'POST',
    body: {
      email: currentUser.email
    }
  })

  await dispatch('fetchCurrentUser', { forceRefresh: true })

  return customer
}

export async function createCheckoutSession ({ getters, dispatch }, { body }) {
  const session = await stelace.providers.stripeRequest({
    url: `/v1/checkout/sessions`,
    method: 'POST',
    body
  })

  return session
}

export async function createSubscription ({ getters, dispatch }, { plan, token }) {
  const currentUserStripeCustomer = getters.currentUserStripeCustomer

  if (!currentUserStripeCustomer) {
    throw new Error('Missing Stripe customer for current user')
  }

  let cardId = currentUserStripeCustomer.default_source

  if (!cardId) {
    const card = await stelace.providers.stripeRequest({
      url: `/v1/customers/${currentUserStripeCustomer.id}/sources`,
      method: 'POST',
      body: {
        source: token.id
      }
    })

    cardId = card.id
  }

  const subscription = await stelace.providers.stripeRequest({
    url: '/v1/subscriptions',
    method: 'POST',
    body: {
      customer: currentUserStripeCustomer.id,
      default_source: cardId,
      items: [
        { plan: plan.id }
      ],
      tax_percent: plan.taxPercent
    }
  })

  await dispatch('fetchCurrentUser', { forceRefresh: true })

  return subscription
}

export async function cancelSubscription ({ dispatch }, { subscription, atPeriodEnd = true }) {
  if (atPeriodEnd) {
    await stelace.providers.stripeRequest({
      url: `/v1/subscriptions/${subscription.id}`,
      method: 'POST',
      body: {
        cancel_at_period_end: true
      }
    })
  } else {
    await stelace.providers.stripeRequest({
      url: `/v1/subscriptions/${subscription.id}`,
      method: 'DELETE',
      body: {}
    })
  }

  await dispatch('fetchCurrentUser', { forceRefresh: true })
}

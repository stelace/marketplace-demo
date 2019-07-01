import { get, isFinite } from 'lodash'
import { getCurrencyFraction } from 'src/utils/currencies'

export function getStripeCustomer (user) {
  return get(user, 'platformData._private.stripeCustomer')
}

// Subscription object: https://stripe.com/docs/api/subscriptions/object
export function getStripeCustomerSubscription (user) {
  const stripeCustomer = getStripeCustomer(user)

  const info = {
    id: null,
    plan: null,
    status: null,
    currentPeriodStartDate: null,
    currentPeriodEndDate: null,
    cancelAtPeriodEnd: null,
    startDate: null,
    endedDate: null,
    cancelledDate: null
  }

  if (!stripeCustomer) return info

  const subscription = stripeCustomer.subscriptions.data[0]
  if (!subscription) return info

  info.id = subscription.id
  info.plan = formatPlan(subscription.plan)
  info.status = subscription.status
  info.currentPeriodStartDate = convertTimestampToISO(subscription.current_period_start)
  info.currentPeriodEndDate = convertTimestampToISO(subscription.current_period_end)
  info.cancelAtPeriodEnd = subscription.cancel_at_period_end
  info.startDate = convertTimestampToISO(subscription.created)
  info.endedDate = convertTimestampToISO(subscription.ended_at)
  info.cancelledDate = convertTimestampToISO(subscription.canceled_at)

  return info
}

// Plan object: https://stripe.com/docs/api/plans/object
export function formatPlan (stripePlan) {
  const currency = stripePlan.currency
  const taxIncluded = stripePlan.metadata.taxIncluded === 'true'

  const interval = stripePlan.interval
  let nbTimeUnits = stripePlan.interval_count
  if (interval === 'year') {
    nbTimeUnits *= 12
  }

  let taxPercent = 0
  if (stripePlan.metadata.taxPercent && !isNaN(stripePlan.metadata.taxPercent)) {
    const tmpTaxPercent = parseFloat(stripePlan.metadata.taxPercent)
    if (isFinite(tmpTaxPercent) && tmpTaxPercent >= 0) {
      taxPercent = Math.round(tmpTaxPercent * 100) / 100
    }
  }

  const isoPrice = stripePlan.amount

  const isoPriceTaxIncluded = taxIncluded
    ? isoPrice
    : Math.round(stripePlan.amount + stripePlan.amount * taxPercent / 100)

  const isoPriceTaxExcluded = taxIncluded
    ? isoPrice / (1 + taxPercent / 100)
    : isoPrice

  const timeUnitPrice = nbTimeUnits > 1 ? getLocalPrice(Math.round(isoPriceTaxExcluded / nbTimeUnits), currency) : null
  const price = getLocalPrice(isoPrice, currency)
  const priceTaxIncluded = getLocalPrice(isoPriceTaxIncluded, currency)
  const priceTaxExcluded = getLocalPrice(isoPriceTaxExcluded, currency)

  const plan = {
    id: stripePlan.id,
    createdDate: convertTimestampToISO(stripePlan.created),
    product: stripePlan.product,
    price,
    priceTaxIncluded,
    priceTaxExcluded,
    isoPrice,
    isoPriceTaxIncluded,
    isoPriceTaxExcluded,
    currency,
    interval,
    nbTimeUnits,
    timeUnitPrice,
    timeUnit: 'M', // Only timeUnit 'per month' is available for plans for now
    features: [],
    highlight: stripePlan.metadata.highlight === 'true',
    isFree: stripePlan.metadata.free === 'true',
    stelaceLabel: stripePlan.metadata.stelaceLabel,
    taxPercent,
  }

  return plan
}

function getLocalPrice (price, currency) {
  const currencyFraction = getCurrencyFraction(currency)
  return price / Math.pow(10, currencyFraction)
}

function convertTimestampToISO (timestamp) {
  if (timestamp === null) return null
  return new Date(timestamp * 1000).toISOString()
}

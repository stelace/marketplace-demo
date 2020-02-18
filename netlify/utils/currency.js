// Port in ES6 modules for currency util from Stelace project
// https://github.com/stelace/stelace/blob/dev/src/util/currency.js

import isoCurrencies from 'mobitel-iso-4217-currencies'

export function isValidCurrency (currency) {
  return isoCurrencies.validate(currency)
}

export function getISOAmount (amount, currency) {
  const obj = isoCurrencies.get(currency)
  if (!obj) throw new Error('Invalid currency')

  return Math.floor(amount * Math.pow(10, obj.minor))
}

export function getStandardAmount (amount, currency) {
  const obj = isoCurrencies.get(currency)
  if (!obj) throw new Error('Invalid currency')

  return amount / Math.pow(10, obj.minor)
}

export function getCurrencyDecimal (currency) {
  const obj = isoCurrencies.get(currency)
  if (!obj) throw new Error('Invalid currency')

  return obj.minor
}

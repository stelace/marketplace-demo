import Stripe from 'stripe'
import { initStelaceSdk } from '../../src/utils/stelace'

export function loadSdks ({ stelace = true, stripe = false } = {}) {
  const sdks = {
    stelace: null,
    stripe: null,
  }

  if (stelace) {
    if (!process.env.STELACE_SECRET_API_KEY) {
      throw new Error('Missing Stelace secret API key')
    }

    sdks.stelace = initStelaceSdk({
      apiKey: process.env.STELACE_SECRET_API_KEY,
      apiBaseURL: process.env.STELACE_API_URL
    })
  }

  if (stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret API key')
    }

    sdks.stripe = Stripe(process.env.STRIPE_SECRET_KEY)
  }

  return sdks
}

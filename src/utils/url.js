// `process.env.CONTEXT` and `process.env.DEPLOY_PRIME_URL` are environment variables from Netlify
// https://docs.netlify.com/configure-builds/environment-variables/#build-metadata

// In Netlify functions (server-side) environment, use this function *after* `loadNetlifyEnv()`
// from 'netlify/utils/env.js' has been called
// to get `process.env.CONTEXT` that is injected in app at build time (yarn functions:build)
export const getWebsiteUrl = () => {
  return typeof process.env.CONTEXT === 'undefined' || process.env.CONTEXT === 'production'
    ? process.env.STELACE_INSTANT_WEBSITE_URL
    : process.env.DEPLOY_PRIME_URL
}

// You can use `websiteUrl` directly in client side
export const websiteUrl = getWebsiteUrl()

export const paymentsApi = {
  getStripeCustomer: process.env.NETLIFY_FUNCTION_GET_STRIPE_CUSTOMER_URL ||
    `${websiteUrl}/.netlify/functions/getStripeCustomer`,
  createStripeCheckoutSession: process.env.NETLIFY_FUNCTION_CREATE_STRIPE_CHECKOUT_SESSION_URL ||
    `${websiteUrl}/.netlify/functions/createStripeCheckoutSession`,
  linkStripeAccount: process.env.NETLIFY_FUNCTION_LINK_STRIPE_ACCOUNT ||
    `${websiteUrl}/.netlify/functions/linkStripeAccount`,
}

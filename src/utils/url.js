const origin = process.env.DEPLOY_PRIME_URL || process.env.STELACE_INSTANT_WEBSITE_URL

export const paymentsApi = {
  getStripeCustomer: process.env.NETLIFY_FUNCTION_GET_STRIPE_CUSTOMER_URL ||
    `${origin}/.netlify/functions/getStripeCustomer`,
  createStripeCheckoutSession: process.env.NETLIFY_FUNCTION_CREATE_STRIPE_CHECKOUT_SESSION_URL ||
    `${origin}/.netlify/functions/createStripeCheckoutSession`,
  linkStripeAccount: process.env.NETLIFY_FUNCTION_LINK_STRIPE_ACCOUNT ||
    `${origin}/.netlify/functions/linkStripeAccount`,
}

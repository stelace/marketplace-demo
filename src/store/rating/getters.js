export function ratingsActive () {
  return process.env.VUE_APP_DISABLE_RATINGS !== 'true'
}

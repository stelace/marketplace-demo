export default async ({ Vue }) => {
  if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_DEBUG_STYLES === 'true') {
    Vue.prototype.$stlDebugStyles = true
  }
}

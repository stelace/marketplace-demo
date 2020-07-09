import logger from 'src/utils/logger'

export default async ({ Vue }) => {
  // Note that Vue errorHandler is called by Sentry (utils/logger).
  // Some error handling logic must be shared with
  // Sentry handling further below, in case Sentry is not used.
  Vue.config.errorHandler = function (err, vm, info) {
    // `info` is a Vue-specific error info, e.g. which lifecycle hook
    // the error was found in. Only available in 2.2.0+

    logger(err)

    // Restore default behavior Vue.util: https://github.com/vuejs/vue/issues/8433
    if (info && process.env.DEV) Vue.util.warn(`Error in ${info}: "${err.toString()}"`, vm)

    handleChunkError(err)
  }
}

function handleChunkError (err) {
  // Reload app and ignore cache to fix broken chunks after app update.
  // Stelace Signal helps to make it smoother for connected clients,
  // but some users can come back later and have missed "appUpdate" signal.
  const isChunkError = err.message && (
    /Loading( CSS)? chunk .+ failed/i.test(err.message) ||
    // SPA index.html may be served instead of missing chunk
    /Unexpected token </i.test(err.message) ||
    /expect.+</i.test(err.message)
  )

  // Much more likely to be handled by index.(template.)html
  // since Webpack chunk errors happen before app boot
  // but we still use the following message to track any exception in Sentry.
  if (isChunkError) {
    logger(`chunkError: ${err.message}`, { isMessage: true })
  }

  if (isChunkError && window.location.hash !== '#reload') {
    window.location.hash = '#reload'
    window.location.reload(true)
  }
}

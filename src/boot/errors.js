import { getStelaceEnv } from 'src/utils/stelace'
import EventBus from 'src/utils/event-bus'

const sentryDSN = process.env.VUE_APP_SENTRY_LOGGING_DSN
const stelaceEnv = getStelaceEnv()

// Detect if we’re using Netlify branch deploy to set logging environment
// https://www.netlify.com/docs/continuous-deployment/#environment-variables
const branchDeploy = process.env.DEV && process.env.CONTEXT ? process.env.BRANCH : ''

let remoteLogger = { capture: _ => _ }

export default async ({ Vue }) => {
  // Note that Vue errorHandler is called by Sentry.
  // Some error handling logic must be shared with
  // Sentry handling further below, in case Sentry is not used.
  Vue.config.errorHandler = function (err, vm, info) {
    // `info` is a Vue-specific error info, e.g. which lifecycle hook
    // the error was found in. Only available in 2.2.0+

    // already handled by App.vue
    if (err.message && err.message.toLowerCase().includes('user session expired')) return

    EventBus.$emit('error')

    // Restore default behavior Vue.util: https://github.com/vuejs/vue/issues/8433
    if (info) Vue.util.warn(`Error in ${info}`, vm)
    if (process.env.DEV) console.error(err) // eslint-disable-line

    handleChunkError(err)
  }

  // Must init sentry _after_ customizing Vue.config.errorHandler
  // https://github.com/getsentry/sentry-javascript/blob/master/packages/integrations/src/vue.ts#L72
  if (!process.env.DEV && sentryDSN) {
    const [Sentry, { Vue: SentryVue }] = await Promise.all([
      import(/* webpackChunkName: 'logging' */ '@sentry/browser'),
      import(/* webpackChunkName: 'logging' */ '@sentry/integrations')
    ])

    Sentry.init({
      dsn: sentryDSN,
      environment: branchDeploy ? `${stelaceEnv}-${branchDeploy}` : stelaceEnv,
      release: process.env.VUE_APP_GIT_COMMIT_SHA,
      integrations: [
        new SentryVue({
          Vue,
          attachProps: false, // disabling for privacy
        }),
      ],
      // https://github.com/quasarframework/quasar/issues/2233
      ignoreErrors: ['ResizeObserver loop']
    })

    Sentry.configureScope((scope) => {
      scope.setTag('stelaceEnv', stelaceEnv)
    })

    Vue.prototype.$sentry = Sentry
    remoteLogger.capture = err => {
      if (err.message && err.message.toLowerCase().includes('user session expired')) return

      const { name, message } = err
      Sentry.captureException(err)
      handleChunkError({ name, message })
    }
    remoteLogger.message = msg => Sentry.captureMessage(msg)
  }

  Vue.prototype.$remoteLogger = remoteLogger
}

export function getRemoteLogger () {
  return remoteLogger
}

function handleChunkError (err) {
  // Reload app and ignore cache to fix broken chunks after app update
  // Stelace Signal helps to make it smoother for connected clients
  // But some users can come back later and have missed "appUpdate" signal
  const isChunkError = err.message && (
    /Loading( CSS)? chunk .+ failed/i.test(err.message) ||
    // SPA index.html may be served instead of missing chunk
    /Unexpected token </i.test(err.message) ||
    /expect.+</i.test(err.message)
  )

  // Much more likely to be handled by index.(template.)html
  // since Webpack chunk errors happen before app boot
  // We use the following message to track any exception in Sentry
  if (remoteLogger.message && isChunkError) {
    remoteLogger.message(`chunkError: ${err.message}`)
  }

  if (isChunkError && window.location.hash !== '#reload') {
    window.location.hash = '#reload'
    window.location.reload(true)
  }
}

import EventBus from 'src/utils/event-bus'
import { getRemoteLogger } from 'src/boot/errors'

/**
 * Send error to remote logging service or to console during development,
 * and show a notification to user if options.notification is either true or a translation key string.
 * @param {Error|String} err
 * @param {Object} [options] You can use the options exposed by Notify mixin.
 * @param {Boolean|String|Object} [options.notification] - Set to
 *   - `true` to use default error message,
 *   - or a valid translation content key String such as `error.failed_updoad`,
 *   - or a full options object expected by Notify mixin.
 * @param {Object} [options.level=error] - console level (error, info…)
 */
export default function logger (err, options = {}) {
  const level = options.level
  const { capture } = getRemoteLogger()

  /* eslint-disable no-console */
  if (!level || level === 'error') {
    if (process.env.DEV) console.error(err, options.data)
    else capture(err)
  } else {
    if (process.env.DEV) console[level](err, options.data)
    else capture(err)
  }
  /* eslint-enable no-console */

  // already handled by `handleUserSessionExpiration` in App.vue
  if (err.message.toLowerCase().includes('user session expired')) return

  // Send error to App.vue to be able to use notify mixin in UI
  // Note that we have to pass notification set to true or to translation content key string
  // for a notification to show up, to avoid duplicate with some notification shown previously.
  EventBus.$emit('error', options)
}

export const defaultPosition = 'bottom'
export const defaultDelay = 5000

// Docs: https://v1.quasar-framework.org/quasar-plugins/notify#Notify-API
export default {
  methods: {
    notify (message, options = {}) {
      const textColor = options.textColor || 'white'
      const i18n = typeof options.i18n === 'boolean' ? options.i18n : true
      const i18nValues = options.i18nValues || {}

      const newOptions = {
        color: 'primary',
        textColor,
        position: defaultPosition,
        timeout: defaultDelay,
        actions: [
          { label: '✕', color: textColor }, // prefer using actions than the prop closeBtn because we can set the text color
        ],
        ...options,
      }

      return this.$q.notify({
        message: i18n ? this.$t({ id: message }, i18nValues) : message,
        ...newOptions,
      })
    },

    notifySuccess (message, options) {
      return this.notify(message, { color: 'positive', ...options })
    },

    notifyFailure (message, options) {
      return this.notify(message, { color: 'negative', ...options })
    },

    notifyInfo (message, options) {
      return this.notify(message, { color: 'info', ...options })
    },

    notifyWarning (message, options) {
      return this.notify(message, { color: 'warning', ...options })
    },
  }
}

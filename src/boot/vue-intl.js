import VueIntl from 'vue-intl'
import { get } from 'lodash'
import * as parser from 'intl-messageformat-parser'

import logger from 'src/utils/logger'
import EventBus from 'src/utils/event-bus'

const isProdEnv = process.env.NODE_ENV === 'production'

// ICU MessageFormat translations can explicitly handle undefined values using 'undefined {fallback content}'
// This RexExp detects if they do by matching matches select values on multiple lines.
// Only empty other{} block is considered equivalent to undefined{…} block, since some translations
// may need a real value in other{…} block like 'other {default content using {value}}'
// So we must still throw when other{…} block is not empty and there is no undefined{…} block specified.
const optionalValuesRegex = /{([^,{}]+),\s*select\s*,[^,]*(undefined\s*{|other\s*{})/g

export default async ({ Vue, store }) => {
  Vue.use(VueIntl)

  // App url could be another way to set language
  // e.g. some.marketplace.com/fr/s
  const locale = process.env.VUE_APP_DEFAULT_LANGUAGE || store.state.content.defaultLocale
  const currency = process.env.VUE_APP_DEFAULT_CURRENCY || store.state.content.defaultCurrency

  // wait for initial translations to load before translating anything

  await store.dispatch('fetchAppContent', { locale, currency })

  // Custom Helper
  Vue.prototype.$t = function (messageDescriptor, values = {}) {
    const key = messageDescriptor.id
    const translation = get(store.getters.entries, key)

    const isMissing = typeof translation !== 'string'
    const hasDefault = !!messageDescriptor.defaultMessage

    if (isMissing) {
      if (isProdEnv) {
        return ''
      } else if (!hasDefault) { // vue-intl already throws an error when defaultMessage is set
        logger(`Missing message: "${key}" for locale: "${store.state.content.locale}`)
        return key
      }
    }

    let valueSearch
    let fallbackValues = { SERVICE_NAME: process.env.VUE_APP_SERVICE_NAME }

    while ((valueSearch = optionalValuesRegex.exec(translation)) !== null) {
      fallbackValues[valueSearch[1].trim()] = undefined
    }

    const contentEdition = store.state.content.contentEdition
    const selectedEntry = store.state.content.selectedEntry

    // emits the ICU format error only if content edition is enabled
    // and if an entry is selected
    if (contentEdition && selectedEntry) {
      const { entry, field } = selectedEntry
      const selectedEntryKey = `${entry}.${field}`

      if (key === selectedEntryKey) {
        try {
          parser.parse(translation)
        } catch (err) {
          EventBus.$emit('postContentMessage', {
            type: 'stelaceContentError',
            entry,
            field,
            error: err.message
          })
        }
      }
    }

    return Vue.prototype.$formatMessage(messageDescriptor, Object.assign({}, fallbackValues, values))
  }
}

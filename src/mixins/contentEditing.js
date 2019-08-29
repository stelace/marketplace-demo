import { mapState, mapGetters } from 'vuex'
import { get, isPlainObject, isBoolean, isString } from 'lodash'

import * as mutationTypes from 'src/store/mutation-types'

import EventBus from 'src/utils/event-bus'
import { escapeRegexp } from 'src/utils/string'

let parser

export default {
  data () {
    return {
      originRegExps: null,
    }
  },
  computed: {
    ...mapGetters([
      'entries',
    ]),
    ...mapState([
      'content'
    ]),
  },
  mounted () {
    window.addEventListener('message', this.receiveMessage, false)
    EventBus.$on('postContentMessage', this.postContentMessage)
  },
  methods: {
    isAllowedOrigin (origin) {
      if (!this.originRegExps) {
        const origins = process.env.VUE_APP_POST_MESSAGE_ALLOWED_ORIGINS
          .split(',')
          .map(o => o.trim())

        this.originRegExps = origins.map(o => {
          if (o === '*') return /^.*$/

          // all (sub)domains wildcards such as http://*.example.com
          const str = `^${escapeRegexp(o).replace(/\\\*/g, '[^/]*')}$`
          return new RegExp(str)
        })
      }

      return this.originRegExps.some(regexp => regexp.test(origin))
    },
    // messages received from Stelace Dashboard
    async receiveMessage (event) {
      if (!this.isAllowedOrigin(event.origin)) return
      if (!isString(event.type) || !isPlainObject(event.data)) return

      const data = event.data

      if (data.type === 'stelaceContentEditing') {
        const { active } = data
        if (!isBoolean(active)) return

        this.$store.commit({
          type: mutationTypes.SET_CONTENT_EDITING,
          origin: event.origin,
          active
        })
        this.postContentMessage({
          type: 'stelaceContentEditingEnabled',
          enabled: active,
          locale: this.content.locale,
          publishableKey: process.env.STELACE_PUBLISHABLE_API_KEY
        })
      } else if (data.type === 'stelaceContentEdited') {
        const { entry, field, value, defaultValue, locale } = data

        const content = typeof get(value, 'transformed') === 'string' ? value.transformed : value
        const parsed = await this.isValidICUContent(content)

        if (parsed && isString(entry) && isString(field) && locale === this.content.locale) {
          this.$store.commit({
            type: mutationTypes.EDIT_ENTRY,
            entry,
            field,
            value,
            defaultValue
          })
          this.$store.commit(mutationTypes.SET_CONTENT_UPDATED_DATE)
        }
      }
    },
    // emits messages to Stelace Dashboard
    postContentMessage (payload) {
      if (!isPlainObject(payload)) return

      const allowedTypes = [
        'stelaceContentError',
        'stelaceContentSelected',
        'stelaceContentEditingEnabled'
      ]

      const { type, entry, field, error, locale, enabled } = payload
      if (!allowedTypes.includes(type)) return
      if (type === 'stelaceContentError' && !isString(error)) return
      if (type === 'stelaceContentEditingEnabled') {
        if (!isString(locale) || !isBoolean(enabled)) return
      } else if (!isString(entry) || !isString(field)) {
        return
      }

      const w = window.top || window
      w.postMessage(payload, this.content.messageOrigin)
    },
    async isValidICUContent (value) {
      if (!value) return true
      const contentEditing = this.content.contentEditing
      const selectedEntry = this.content.selectedEntry

      if (contentEditing) {
        const { entry, field } = selectedEntry || {}

        try {
          if (!parser) parser = await import('intl-messageformat-parser')
          parser.parse(value)
        } catch (err) {
          EventBus.$emit('postContentMessage', {
            type: 'stelaceContentError',
            entry,
            field,
            error: err.message
          })
          return false
        }
        return true
      }
    },
  }
}

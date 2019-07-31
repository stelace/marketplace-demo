import { mapState, mapGetters } from 'vuex'
import { isPlainObject, isBoolean, isString, get } from 'lodash'

import * as mutationTypes from 'src/store/mutation-types'
import * as escapeRegexp from 'escape-string-regexp'

import EventBus from 'src/utils/event-bus'

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

          const str = `^${escapeRegexp(o).replace(/\\\*/g, '[^/]*')}$`
          return new RegExp(str)
        })
      }

      return this.originRegExps.some(regexp => regexp.test(origin))
    },
    // messages received from Stelace Dashboard
    receiveMessage (event) {
      if (!this.isAllowedOrigin(event.origin)) return
      if (!isString(event.type) || !isPlainObject(event.data)) return

      const data = event.data

      if (data.type === 'stelaceContentEdition') {
        const { active } = data

        if (isBoolean(active)) {
          this.$store.commit({
            type: mutationTypes.SET_CONTENT_EDITION,
            origin: event.origin,
            active
          })
        }
      } else if (data.type === 'stelaceContentEdited') {
        const { entry, field, value } = data

        if (isString(entry) && isString(field)) {
          this.$store.commit({
            type: mutationTypes.EDIT_ENTRY,
            entry,
            field,
            value
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
        'stelaceContentSelected'
      ]

      const { type, entry, field, error } = payload
      if (!allowedTypes.includes(type) || !isString(entry) || !isString(field)) return
      else if (type === 'stelaceContentError' && !isString(error)) return

      const w = window.top || window
      w.postMessage(payload, this.content.messageOrigin)
    },
    async checkICUContent () {
      const contentEdition = this.content.contentEdition
      const selectedEntry = this.content.selectedEntry

      // emits the ICU format error only if content edition is enabled
      // and if an entry is selected
      if (contentEdition && selectedEntry) {
        const { entry, field } = selectedEntry
        const selectedEntryKey = `${entry}.${field}`

        const content = get(this.entries, selectedEntryKey)
        if (!content) return

        try {
          if (!parser) {
            parser = await import('intl-messageformat-parser')
          }

          parser.parse(content)
        } catch (err) {
          EventBus.$emit('postContentMessage', {
            type: 'stelaceContentError',
            entry,
            field,
            error: err.message
          })
        }
      }
    },
  }
}

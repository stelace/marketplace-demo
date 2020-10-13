<template>
  <div
    id="q-app"
    :key="content.locale + content.currency + '-' + content.lastContentUpdatedDate"
  >
    <!-- Hack to re-render the app when locale or currency change -->
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import { get, debounce } from 'lodash'

import { getAuthToken } from 'src/utils/auth'
import EventBus from 'src/utils/event-bus'
import { initSentry } from 'src/utils/logger'
import stelace from 'src/utils/stelace'

import CartMixin from 'src/modules/ecommerce/mixins/cart'
import contentEditingMixin from 'src/mixins/contentEditing'

export default {
  mixins: [
    CartMixin,
    contentEditingMixin,
  ],
  data () {
    return {
      // socket: null // don’t declare since we don’t want vue reactivity
    }
  },
  computed: {
    ...mapGetters([
      'isNaturalUser',
      'currentUser',
      'isEcommerceMarketplace',
    ])
  },
  watch: {
    // if the socket connection has been ended due to too long inactivity
    // recreate the socket
    '$q.appVisible' (visible) {
      if (!this.socket) return
      if (visible && !this.socket.connected) this.refreshSocket()
    },

    async currentUser (current, previous) {
      if (this.isEcommerceMarketplace) {
        if (current.id !== previous.id) {
          const isAuthed = Boolean(current.id)
          if (isAuthed) {
            this.syncCart()
          } else {
            this.emptyCart()
          }
        }
      }
    },
  },
  created () {
    EventBus.$on('error', ({ data, level, notification } = {}) => {
      const defaultMessage = notification === true ? 'error.unknown_happened_header' : ''
      // notification can be an object containing notify options + message
      const message = defaultMessage || get(notification, 'message') || notification

      if (!message) return // show nothing by default

      if (!level || level === 'error') this.notifyFailure(message, notification)
      else this.notify(message)
    })

    this.$router.afterEach(this.handleRouteQuery)
  },
  mounted () {
    this.$store.dispatch('initApp')

    this.handleUserSessionExpiration()

    setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(initSentry)
      else setTimeout(initSentry, 0)
    }, 5000)

    // give some time to slower devices before loading socket.io
    // which is non-essential JS, and even useless during short sessions
    const socketIoTimeout = 10000 // delay up to twice this value
    setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(this.loadSocketIo)
      else setTimeout(this.loadSocketIo, socketIoTimeout)
    }, socketIoTimeout)
  },
  methods: {
    async loadSocketIo () {
      this.socket = (await import(/* webpackChunkName: 'socket.io' */ 'src/signal')).default
      // split microtask
      if ('requestIdleCallback' in window) requestIdleCallback(this.initSocketIo)
      else setTimeout(this.initSocketIo, 0)
    },
    initSocketIo () {
      this.socket.open()
      this.setSocketSignals()
      EventBus.$on('refreshSocket', this.refreshSocket)
    },
    setSocketSignals () {
      // https://stelace.com/docs/signal.html
      // https://socket.io/docs/client-api/#socket-on-eventName-callback
      this.socket.on('authentication', (signalId, authCallback) => {
        const publishableKey = process.env.STELACE_PUBLISHABLE_API_KEY
        const authToken = getAuthToken()
        let channels = []
        const organizationId = !this.isNaturalUser ? this.currentUser.id : undefined

        if (organizationId) channels = [...channels, organizationId]

        if (typeof authCallback === 'function' && publishableKey) authCallback({ publishableKey, authToken, channels })

        this.socket.signalId = signalId
      })

      this.socket.on('appUpdate', ({ message = {} }) => {
        const { noCache = true } = message
        // refresh page dialog when app is updated to prevent missing features or broken webpack chunks
        this.$store.commit(mutationTypes.SET_APP_UPDATE_AVAILABLE, { noCache })
      })

      this.socket.on('newMessage', async ({ message }) => {
        await this.$store.dispatch('fetchMessages')
        EventBus.$emit('newMessage')
      })

      /* this.socket.on('signal', data => {
        // default Signal event name
      }) */
    },
    refreshSocket () {
      if (!this.socket) return
      this.socket.close()
      this.socket.open()
    },
    handleRouteQuery () {
      const hash = this.$route.hash
      // Assuming 2-second delay is enough to prevent infinite reload loop
      // with webpack chunk loading error
      if (hash === '#reload') {
        setTimeout(() => {
          this.$router.replace(Object.assign({}, this.$route, { hash: '' }))
        }, 2000)
      }
    },
    handleUserSessionExpiration () {
      // use debounce function to prevent notification spamming
      // due to multiple requests failing after session expiration
      const debouncedEmitUserSessionExpiredError = debounce(() => {
        this.notifyInfo('error.user_session_expired', { timeout: 10000 })

        this.$store.dispatch('logout', { sessionExpired: true })
      }, 2000)

      stelace.onError('userSessionExpired', () => {
        debouncedEmitUserSessionExpiredError()
      })
    },
  },
}
</script>

<style></style>

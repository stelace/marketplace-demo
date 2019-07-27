<template>
  <div
    id="q-app"
    :key="content.locale + content.currency"
  >
    <!-- Hack to re-render the app when locale or currency change -->
    <router-view />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import { get, debounce, isPlainObject, isBoolean, isString } from 'lodash'

import { getAuthToken } from 'src/utils/auth'
import EventBus from 'src/utils/event-bus'
import stelace from 'src/utils/stelace'

export default {
  sockets: {
    // Move these to mixin if needed in other components
    /* eslint-disable camelcase */
    connect () {
      // console.log('Stelace Signal connected')
    },
    authentication (signal_id, authCallback) {
      const publishableKey = process.env.STELACE_PUBLISHABLE_API_KEY
      const authToken = getAuthToken()
      let channels = []
      const organizationId = !this.isNaturalUser ? this.currentUser.id : undefined

      if (organizationId) channels = [...channels, organizationId]

      if (typeof authCallback === 'function' && publishableKey) authCallback({ publishableKey, authToken, channels })

      this.$socket.signal_id = signal_id
    },
    signal (data) {
      // default Signal event name
    },
    appUpdate ({ noCache = true } = {}) {
      // refresh page dialog when app is updated to prevent missing features or broken webpack chunks
      this.$store.commit(mutationTypes.SET_APP_UPDATE_AVAILABLE, { noCache })
    }
    /* eslint-enable camelcase */
  },
  data () {
    return {
      hasLoadingScreen: true,
      hideLoadingScreenTimeout: null
    }
  },
  computed: {
    allowedMessageOrigins () {
      return process.env.VUE_APP_POST_MESSAGE_ALLOWED_ORIGINS
    },
    ...mapState([
      'content'
    ]),
    ...mapGetters([
      'isNaturalUser',
      'currentUser'
    ])
  },
  watch: {
    // if the socket connection has been ended due to too long inactivity
    // recreate the socket
    '$q.appVisible' (visible) {
      if (visible && !this.$socket.connected) {
        this.refreshSocket()
      }
    }
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
  },
  async mounted () {
    this.$store.dispatch('initApp')
    this.hideLoadingScreen()

    this.$socket.open()

    this.handleUserSessionExpiration()

    // only subscribe in client-side (mounted function)
    EventBus.$on('refreshSocket', () => {
      this.refreshSocket()
    })

    this.$router.afterEach((to, from) => {
      if (this.hasLoadingScreen && from && from.name === 'home') {
        clearTimeout(this.hideLoadingScreenTimeout)
        let loadingBackground = window.document.querySelector('#app-loading-background')
        loadingBackground.classList.add('-hide')
      }
    })

    window.addEventListener('message', this.receiveMessage, false)
    EventBus.$on('postContentMessage', this.postContentMessage)
  },
  methods: {
    async hideLoadingScreen () {
      let loadingContainer = window.document.querySelector('#app-loading-container')
      let loadingBackground = window.document.querySelector('#app-loading-background')

      if (loadingContainer) loadingContainer.classList.add('loaded')

      // first currentRoute is MainLayout so we rather use window.location
      const path = window.location.pathname
      // Ensuring smooth transition with home hero background
      if (!loadingBackground) return
      if (path === '/') {
        await new Promise(resolve => {
          this.hideLoadingScreenTimeout = setTimeout(() => {
            this.hasLoadingScreen = false
            resolve()
          }, 10000)
        })
        loadingBackground.classList.add('-hide')
      } else {
        loadingBackground.classList.add('-fade-out')
      }
    },
    refreshSocket () {
      this.$socket.close()
      this.$socket.open()
    },
    handleUserSessionExpiration () {
      // use debounce function to prevent notification spamming
      // due to multiple requests failing after session expiration
      const debouncedEmitUserSessionExpiredError = debounce(() => {
        this.notifyInfo('error.user_session_expired', { timeout: 10000 })
        const tokenStore = stelace.getTokenStore()
        tokenStore.removeTokens()

        this.$store.dispatch('logout', { sessionExpired: true })
      }, 2000)

      stelace.onError('userSessionExpired', () => {
        debouncedEmitUserSessionExpiredError()
      })
    },
    // messages received from Stelace Dashboard
    receiveMessage (event) {
      const origins = this.allowedMessageOrigins.split(',')

      if (this.allowedMessageOrigins !== '*' && !origins.includes(event.origin)) return
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

      window.postMessage(payload, this.content.messageOrigin)
    },
  },
}
</script>

<style></style>

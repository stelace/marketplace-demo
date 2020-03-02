import { mapGetters } from 'vuex'
import { get } from 'lodash'

const state = 'stripe_oauth'

export default {
  computed: {
    hasLinkedStripeAccount () {
      if (!this.isCurrentUser) return false
      return !!get(this.currentUser, 'platformData._private.stripeAccount')
    },
    ...mapGetters([
      'currentUser',
      'stripeActive',
    ])
  },
  methods: {
    async loadStripe () {
      if (!this.stripeActive) throw new Error('Stripe is not active')

      await loadScript()

      const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
      return stripe
    },
    getOAuthStandardAccountUrl (user, register = true) {
      let url = 'https://connect.stripe.com/oauth/authorize' +
        '?response_type=code' +
        `&client_id=${process.env.STRIPE_OAUTH_CLIENT_ID}` +
        `&redirect_uri=${process.env.STELACE_INSTANT_WEBSITE_URL}` +
        '&scope=read_write' +
        `&state=${state}` +
        '&suggested_capabilities[]=transfers'

      if (user.email) url += `&stripe_user[email]=${user.email}`
      if (user.firstname) url += `&stripe_user[first_name]=${user.firstname}`
      if (user.lastname) url += `&stripe_user[last_name]=${user.lastname}`
      if (!register) url += 'stripe_landing=login'

      return url
    },
    async linkStripeAccountAfterOAuth () {
      const routeQuery = this.$route.query

      if (!this.stripeActive) return

      const newQuery = Object.assign({}, routeQuery)

      // For response parameters, please consult:
      // https://stripe.com/docs/connect/oauth-reference#get-authorize-response
      if (routeQuery.state === state) {
        if (routeQuery.code && this.currentUser.id) {
          await this.$store.dispatch('linkStripeAccount', { code: routeQuery.code })

          delete newQuery.scope
          delete newQuery.code

          this.notifySuccess('user.account.stripe.account_linked_success_message')
        } else if (routeQuery.error) {
          delete newQuery.error
          delete newQuery.error_description

          this.notifyWarning('user.account.stripe.account_linked_failure_message')
        }

        delete newQuery.state
        this.$router.replace({ query: newQuery })
      }
    },
    displayLinkStripeAccountMessage () {
      if (!this.stripeActive || this.hasLinkedStripeAccount) return

      const goToPublicProfile = () => this.$router.push({ name: 'publicProfile', params: { id: this.currentUser.id } })

      this.notify('user.account.stripe.link_account_notification_message', {
        closeBtn: '✕',
        multiLine: false,
        actions: [
          { label: this.$t({ id: 'navigation.profile' }), color: 'white', handler: goToPublicProfile },
        ],
        timeout: 10 * 60 * 1000 // 10 minutes
      })
    },
  }
}

async function loadScript () {
  const id = 'stripe-script'

  const existingEl = document.querySelector(`#${id}`)
  if (existingEl) return

  const el = document.createElement('script')
  el.id = id
  el.src = 'https://js.stripe.com/v3'
  document.getElementsByTagName('head')[0].appendChild(el)

  return new Promise(resolve => {
    el.addEventListener('load', resolve)
  })
}

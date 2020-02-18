import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'stripeActive'
    ])
  },
  methods: {
    async loadStripe () {
      if (!this.stripeActive) throw new Error('Stripe is not active')

      await loadScript()

      const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
      return stripe
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

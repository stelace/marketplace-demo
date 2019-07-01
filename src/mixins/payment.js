import { pickBy, values } from 'lodash'
import { mapGetters } from 'vuex'

let stripe

export default {
  computed: {
    isSubscriptionActive () {
      const subscription = this.currentUserSubscription
      if (!subscription) return false

      const isActive = ['active', 'trialing'].includes(subscription.status)
      return isActive
    },
    ...mapGetters([
      'entries',
      'currentUser',
      'currentUserSubscription',
      'getContents',
      'isMainOrganization',
    ]),
  },
  methods: {
    async loadStripe () {
      if (stripe) return stripe

      await new Promise(resolve => {
        const script = document.createElement('script')
        script.id = '_stripe-script'
        script.src = 'https://js.stripe.com/v3/'
        script.onload = () => {
          stripe = window.Stripe(process.env.STRIPE_PUBLISH_KEY)
          resolve(stripe)
        }

        document.querySelector('head').append(script)
      })

      return stripe
    },
    async subscribe (selectedPlan) {
      if (this.isSubscriptionActive) {
        this.notifyInfo('payment.subscription.already_subscribed')
        return
      }

      if (!this.isMainOrganization) {
        return this.openSwitchToMainOrganizationDialog({
          onOk: () => this.subscribe(selectedPlan)
        })
      }

      this.openCheckoutConfirmationDialog({
        selectedPlan,
        onOk: () => this.createCheckoutSession(selectedPlan)
      })
    },
    openSwitchToMainOrganizationDialog ({ onOk } = {}) {
      this.$q.dialog({
        className: 'subscription-dialog',
        title: this.$t({ id: 'payment.subscription.switch_to_main_organization_header' }),
        message: this.$t(
          { id: 'payment.subscription.switch_to_main_organization_message' },
          {
            mainOrgName: this.mainOrganization.displayName,
            childOrgName: this.currentUser.displayName
          }
        ),
        ok: {
          label: this.$t({ id: 'prompt.continue_button' }),
          color: 'positive',
          class: 'q-ma-sm'
        }
      }).onOk(() => {
        this.$store.dispatch('selectOrganization', { organizationId: this.mainOrganization.id })

        if (typeof onOk === 'function') onOk()
      })
    },
    openCheckoutConfirmationDialog ({ selectedPlan, onOk } = {}) {
      this.$q.dialog({
        className: 'subscription-dialog',
        title: this.$t({ id: 'payment.subscription.subscription_label' }),
        message: this.$t(
          { id: 'payment.subscription.checkout_confirmation_message' },
          {
            planTitle: selectedPlan.title,
            priceTaxExcluded: selectedPlan.priceTaxExcluded,
            priceTaxIncluded: selectedPlan.priceTaxIncluded,
          }
        ),
        ok: {
          label: this.$t({ id: 'prompt.continue_button' }),
          color: 'positive',
          class: 'q-ma-sm'
        }
      }).onOk(() => {
        if (typeof onOk === 'function') onOk()
      })
    },
    openCheckoutResultDialog (result, { onClose } = {}) {
      this.$q.dialog({
        className: 'subscription-dialog',
        message: this.$t(
          { id: result === 'success'
            ? 'payment.subscription.checkout_success_message'
            : 'payment.subscription.checkout_failure_message'
          }
        ),
        ok: {
          label: this.$t({ id: 'navigation.close' }),
          class: 'q-ma-sm'
        },
        persistent: true
      }).onDismiss(() => {
        if (typeof onClose === 'function') {
          onClose()
        }
      })
    },

    async createCheckoutSession (selectedPlan) {
      const stripe = await this.loadStripe()

      const websiteUrl = process.env.STELACE_INSTANT_WEBSITE_URL

      const session = await this.$store.dispatch('createCheckoutSession', {
        body: {
          payment_method_types: ['card'],
          // do not provide if email is not verified because the user cannot change it in checkout page
          customer_email: this.currentUser.emailVerified ? this.currentUser.email : undefined,

          // must be the current user ID (otherwise, will be rejected by Stelace API)
          client_reference_id: this.currentUser.id,

          success_url: `${websiteUrl}/?subscription_result=success&plan=${selectedPlan.id}`,
          cancel_url: `${websiteUrl}/?subscription_result=cancel&plan=${selectedPlan.id}`,
          subscription_data: {
            items: [
              { plan: selectedPlan.id } // implicit, quantity === 1
            ]
          },
        }
      })

      await stripe.redirectToCheckout({
        sessionId: session.id
      })
    },

    getPlanWithContent (plan) {
      const planContents = this.getContents('instant_plans')
      const commonFeatures = values(
        pickBy(planContents, (v, k) => k.includes('.commonFeatures.'))
      )

      let defaultTitle
      let defaultDescription

      if (!plan.isFree) {
        defaultTitle = this.$t({ id: 'time.unit_label' }, {
          timeUnit: plan.timeUnit,
          nbTimeUnits: plan.nbTimeUnits
        })

        if (plan.price !== plan.priceTaxIncluded) {
          defaultDescription = this.$t({ id: 'payment.subscription.plan_description' }, {
            priceTaxExcluded: plan.price,
            priceTaxIncluded: plan.priceTaxIncluded
          })
        }
      }

      const title = planContents[`instant_plans.${plan.stelaceLabel}.title`] || defaultTitle
      const description = planContents[`instant_plans.${plan.stelaceLabel}.description`] || defaultDescription
      const discountPercent = planContents[`instant_plans.${plan.stelaceLabel}.pricing.discountPercent`]
      const timeUnitPriceText = planContents[`instant_plans.${plan.stelaceLabel}.pricing.timeUnitPriceText`]
      const features = values(
        pickBy(planContents, (v, k) => k.includes(`.${plan.stelaceLabel}.features`))
      )

      let discountValue
      if (discountPercent) discountValue = parseInt(discountPercent) / 100

      return Object.assign({}, plan, {
        title,
        description,
        features: plan.isFree ? features : features.concat(commonFeatures),
        discountValue,
        timeUnitPriceText
      })
    }
  }
}

<script>
import { mapState, mapGetters } from 'vuex'
import { values } from 'lodash'

import EventBus from 'src/utils/event-bus'
import AuthDialogMixin from 'src/mixins/authDialog'
import StripeMixin from 'src/mixins/stripe'

export default {
  mixins: [
    AuthDialogMixin,
    StripeMixin,
  ],
  data () {
    return {
      actionAfterAuthentication: null,
      checkingOut: false,
    }
  },
  computed: {
    ...mapState([
      'style',
      'common',
    ]),
    ...mapGetters([
      'activeAsset',
      'shoppingCart',
      'currentUser',
      'isEcommerceMarketplace',
      'validTransactionOptions',
      'marketplaceType',
    ]),
    isDisabled () {
      if (this.isEcommerceMarketplace) return !this.shoppingCart.lines.length
      else return !this.validTransactionOptions || this.isOwnerCurrentUser
    },
    assetTypes () {
      return values(this.common.assetTypesById)
    },
    timeBased () {
      if (!this.activeAsset) return true
      const assetType = this.common.assetTypesById[this.activeAsset.assetTypeId]
      if (!assetType) return true
      return assetType.timeBased
    },
    isOwnerCurrentUser () {
      return this.currentUser.id === this.activeAsset.ownerId
    },
  },
  mounted () {
    EventBus.$on('authStatusChanged', (status) => this.onAuthChange(status))
  },
  beforeDestroy () {
    EventBus.$off('authStatusChanged', (status) => this.onAuthChange(status))
  },
  methods: {
    onAuthChange (status) {
      if (status === 'success' && this.actionAfterAuthentication) {
        if (this.actionAfterAuthentication === 'checkout') {
          this.checkoutAfterAuth()
        }
        this.actionAfterAuthentication = null
      } else if (status === 'closed') {
        this.actionAfterAuthentication = null
      }
    },
    async checkout () {
      if (this.isDisabled) return

      if (!this.currentUser.id) {
        this.actionAfterAuthentication = 'checkout'
        this.openAuthDialog()
        return
      }
      this.checkoutAfterAuth()
    },
    async checkoutAfterAuth () {
      this.checkingOut = true

      // cannot checkout on her own asset
      if (!this.isEcommerceMarketplace && this.isOwnerCurrentUser) return

      const asset = this.activeAsset
      let order
      let message

      try {
        if (this.isEcommerceMarketplace) {
          ({ order, message } = await this.$store.dispatch('createOrderFromCart'))
        } else {
          ({ order, message } = await this.$store.dispatch('createTransaction', {
            asset,
            withOrder: true
          }))
        }

        if (this.stripeActive) {
          await this.$store.dispatch('getStripeCustomer')
          const sessionId = await this.$store.dispatch('createStripeCheckoutSession', { orderId: order.id })
          const stripe = await this.loadStripe()
          await stripe.redirectToCheckout({ sessionId })
        } else {
          this.$router.push({
            name: 'conversation',
            params: { id: message.conversationId }
          })
        }
      } finally {
        this.checkingOut = false
      }
    },
  },
}
</script>

<template>
  <QBtn
    :rounded="style.roundedTheme"
    :loading="checkingOut"
    :label="$t({ id: 'asset.checkout_action' }, { timeBased, marketplaceType })"
    color="secondary"
    :disabled="isDisabled"
    v-on="$listeners"
    @click="checkout"
  />
</template>

<style>
</style>

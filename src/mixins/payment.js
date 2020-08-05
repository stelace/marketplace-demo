import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'paymentActive',
      'conversations',
      'isEcommerceMarketplace',
    ]),
  },
  methods: {
    async viewConversationAfterSuccessfulPayment () {
      const routeQuery = this.$route.query

      if (!this.paymentActive) return

      if (routeQuery['payment-success'] === 'true' && this.currentUser.id) {
        let findConversationFn

        if (this.isEcommerceMarketplace) {
          const orderId = routeQuery.orderId
          if (!orderId) return

          await this.$store.dispatch('removeAssetsFromOrder', { orderId })

          findConversationFn = (conv) => {
            const order = conv.order

            return order &&
              order.id === orderId &&
              order.payerId === this.currentUser.id
          }
        } else {
          const transactionId = routeQuery.transactionId
          if (!transactionId) return

          findConversationFn = (conv) => {
            const transaction = conv.transaction

            return transaction &&
              transaction.id === transactionId &&
              transaction.takerId === this.currentUser.id
          }
        }

        this.$q.loading.show()

        try {
          await this.$store.dispatch('fetchMessages')
        } finally {
          this.$q.loading.hide()
        }

        const conversation = this.conversations.find(findConversationFn)
        if (conversation) {
          this.notifySuccess('payment.checkout_success_message')
          this.$router.replace({ name: 'conversation', params: { id: conversation.id } })
        }
      } else if (routeQuery['payment-cancel'] === 'true') {
        this.notifyWarning('payment.checkout_failure_message')

        const newQuery = Object.assign({}, routeQuery)
        delete newQuery['payment-cancel']
        this.$router.replace({ query: newQuery })
      }
    }
  },
}

export default {
  data () {
    return {
      conversationViewTriggered: false,
    }
  },
  methods: {
    async viewConversationAfterSuccessfulPayment () {
      const routeQuery = this.$route.query

      if (!this.conversationViewTriggered && this.paymentActive) {
        this.conversationViewTriggered = true

        if (routeQuery['payment-success'] === 'true' && this.currentUser.id) {
          const transactionId = routeQuery.transactionId
          if (!transactionId) return

          this.$q.loading.show()

          try {
            await this.$store.dispatch('fetchMessages')
          } finally {
            this.$q.loading.hide()
          }

          const conversation = this.conversations.find(conv => {
            const transaction = conv.transaction

            return transaction &&
              transaction.id === transactionId &&
              transaction.takerId === this.currentUser.id
          })
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
    }
  },
}

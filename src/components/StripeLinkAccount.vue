<script>
import { mapGetters, mapState } from 'vuex'

import StripeMixin from 'src/mixins/stripe'

export default {
  mixins: [
    StripeMixin,
  ],
  computed: {
    ...mapGetters([
      'currentUser',
      'stripeActive',
    ]),
    ...mapState([
      'style',
    ]),
  },
  methods: {
    linkStripeAccount (register) {
      if (!this.stripeActive) return

      const url = this.getOAuthStandardAccountUrl(this.currentUser, register)
      window.location.href = url
    },
  },
}
</script>

<template>
  <div class="stripe-account-link">
    <AppContent
      tag="h2"
      class="text-h4 text-weight-medium"
      entry="user"
      field="account.stripe.link_account_title"
    />
    <AppContent
      entry="user"
      field="account.stripe.link_account_helper"
    />

    <div class="row justify-center q-col-gutter-md q-mt-md">
      <div>
        <QBtn
          :rounded="style.roundedTheme"
          color="primary"
          @click="linkStripeAccount(false)"
        >
          <AppContent
            entry="user"
            field="account.stripe.link_account_helper_button"
          />
        </QBtn>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>

</style>

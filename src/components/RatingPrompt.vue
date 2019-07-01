<script>
import { mapState } from 'vuex'

export default {
  props: {
    transaction: {
      type: Object,
      default: () => {}
    },
    actions: {
      type: Object,
      default: () => {}
    },
    containerClass: {
      type: String,
      default: ''
    },
    buttonSize: {
      type: String,
      default: undefined
    },
    buttonClass: {
      type: String,
      default: ''
    },
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState([
      'style',
    ]),
  },
  methods: {
    async createTransactionTransition (transitionName, data) {
      try {
        await this.$store.dispatch('createTransactionTransition', {
          transactionId: this.transaction.id,
          transitionName,
          data
        })
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
      }
    },
  },
}
</script>

<template>
  <div :class="[containerClass]">
    <QBtn
      v-if="actions.accept"
      :class="[buttonClass || 'q-ma-xs']"
      :rounded="style.roundedTheme"
      :flat="!style.colorfulTheme"
      :size="buttonSize"
      color="positive"
      @click="createTransactionTransition('accept')"
    >
      <AppContent
        entry="transaction"
        field="prompt.accept_button"
      />
    </QBtn>
    <QBtn
      v-if="actions.confirmAndPay"
      :class="[buttonClass || 'q-ma-xs']"
      :rounded="style.roundedTheme"
      :flat="!style.colorfulTheme"
      :size="buttonSize"
      color="positive"
      @click="createTransactionTransition('confirmAndPay')"
    >
      <AppContent
        entry="transaction"
        field="prompt.confirm_and_pay_button"
      />
    </QBtn>
    <QBtn
      v-if="actions.cancel"
      :class="[buttonClass || 'q-ma-xs']"
      :rounded="style.roundedTheme"
      :flat="!style.colorfulTheme"
      :size="buttonSize"
      color="negative"
      @click="createTransactionTransition('cancel', { cancellationReason: actions.cancellationReason })"
    >
      <AppContent
        entry="transaction"
        field="prompt.reject_button"
      />
    </QBtn>
  </div>
</template>

<style lang="stylus" scoped>
</style>

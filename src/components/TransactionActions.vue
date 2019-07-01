<script>
import { isNil } from 'lodash'
import { mapState } from 'vuex'

import RatingDialog from 'src/components/RatingDialog'

export default {
  components: {
    RatingDialog,
  },
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
    flat: {
      type: Boolean,
      default: undefined
    },
    promptRatings: {
      type: Boolean,
      default: false
    },
    ratingsAuthor: {
      type: Object,
      default: undefined
    },
    ratingsTarget: {
      type: Object,
      default: undefined
    },
    ratingsReadonly: {
      type: Boolean,
      default: true
    },
  },
  data () {
    return {
      savedRatings: [],
      ratingsDialogOpened: false,
    }
  },
  computed: {
    ...mapState([
      'style',
    ]),
    isFlat () {
      return !isNil(this.flat) ? this.flat : !this.style.colorfulTheme
    },
    transactionActions () {
      const transactionActions = []

      if (this.actions.accept) {
        transactionActions.push({
          color: 'positive',
          transitionName: 'accept',
          entryField: 'prompt.accept_button'
        })
      }
      if (this.actions.confirmAndPay) {
        transactionActions.push({
          color: 'positive',
          transitionName: 'confirmAndPay',
          entryField: 'prompt.confirm_and_pay_button'
        })
      }
      if (this.actions.cancel) {
        let entryField = 'prompt.reject_button'

        if (this.actions.cancellationReason === 'withdrawn') {
          entryField = 'prompt.withdraw_button'
        }

        transactionActions.push({
          color: 'negative',
          transitionName: 'cancel',
          entryField,
          data: { cancellationReason: this.actions.cancellationReason }
        })
      }

      return transactionActions
    },
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
    async openRatingDialog () {
      const ratings = await this.$store.dispatch('fetchRatings', { transactionId: this.transaction.id })
      this.savedRatings = ratings

      this.ratingsDialogOpened = true
    },
    closeRatingDialog () {
      this.ratingsDialogOpened = false
    },
    onPartialSaveRatings (savedRatings) {
      this.savedRatings = this.savedRatings.concat(savedRatings)
    },
    onSaveRatings () {
      this.$emit('save', { transactionId: this.transaction.id })
    },
  },
}
</script>

<template>
  <div :class="[containerClass]">
    <QBtn
      v-for="action in transactionActions"
      :key="action.transitionName"
      :class="[buttonClass || 'q-ma-xs']"
      :rounded="style.roundedTheme"
      :flat="isFlat"
      :size="buttonSize"
      :color="action.color"
      @click="createTransactionTransition(action.transitionName, action.data)"
    >
      <AppContent
        entry="transaction"
        :field="action.entryField"
      />
    </QBtn>
    <QBtn
      v-if="promptRatings"
      :class="[buttonClass || 'q-ma-xs']"
      :rounded="style.roundedTheme"
      :flat="isFlat"
      :size="buttonSize"
      color="secondary"
      @click="openRatingDialog()"
    >
      <AppContent
        entry="rating"
        field="your_rating_label"
      />
    </QBtn>

    <RatingDialog
      v-if="promptRatings"
      :opened="ratingsDialogOpened"
      :author="ratingsAuthor"
      :target="ratingsTarget"
      :transaction="transaction"
      :saved-ratings="savedRatings"
      :readonly="ratingsReadonly"
      @close="closeRatingDialog"
      @partial-save="onPartialSaveRatings"
      @save="onSaveRatings"
    />
  </div>
</template>

<style lang="stylus" scoped>
</style>

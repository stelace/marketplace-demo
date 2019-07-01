<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    hasPositiveStatus () {
      if (!this.transaction) return false

      return [
        'validated',
        'completed',
      ].includes(this.transaction.status)
    },
    hasNegativeStatus () {
      if (!this.transaction) return false

      return [
        'cancelled',
      ].includes(this.transaction.status)
    },
    entryField () {
      if (!this.transaction) return

      if (this.transaction.status === 'cancelled') {
        return `status.cancelled.${this.transaction.cancellationReason}`
      } else {
        return `status.${this.transaction.status}`
      }
    }
  },
}
</script>

<template>
  <!-- avoid flash of content by displaying the status only when it's populated -->
  <div
    v-if="transaction && transaction.status"
    :class="
      [
        hasPositiveStatus ? 'transaction-status-positive' : '',
        hasNegativeStatus ? 'transaction-status-negative' : '',
      ]
    "
  >
    <AppContent
      class="text-weight-medium"
      color="primary"
      entry="transaction"
      :field="entryField"
    />
  </div>
</template>

<style lang="stylus" scoped>
.transaction-status-positive
  color: $positive

.transaction-status-negative
  color: $negative
</style>

<script>
import { keyBy } from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { matDelete, matDoneAll, matPause, matPlayArrow, matUpdate } from '@quasar/extras/material-icons'

import logger from 'src/utils/logger'

import ConfirmDeleteDialog from 'src/components/ConfirmDeleteDialog'

import { isAvailable } from 'src/utils/asset'

export default {
  components: {
    ConfirmDeleteDialog,
  },
  props: {
    asset: {
      type: Object,
      required: true
    },
    to: {
      type: Object,
      default: () => null
    },
    showRatings: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      removingAsset: false,
      updatingStatus: false,
      confirmDeleteDialogOpened: false,
      showRemoveAssetWillCancelTransactionWarning: false,
      pendingTransactions: [],
    }
  },
  computed: {
    assetCardAttributes () {
      return {
        asset: this.asset,
        to: this.to,
        showRatings: this.showRatings,
        ...this.$attrs
      }
    },
    paused () {
      return !this.asset.active
    },
    pendingValidation () {
      return !this.asset.validated
    },
    unavailable () {
      const asset = this.asset
      const availabilityGraphByAssetId = this.assetState.availabilityGraphByAssetId

      return !isAvailable({ asset, availabilityGraphByAssetId })
    },
    status () { // Order matters
      if (this.unavailable) return 'unavailable'
      else if (this.paused) return 'paused'
      else if (this.pendingValidation) return 'validationPending'

      return ''
    },
    ...mapState({
      style: state => state.style,
      assetState: state => state.asset,
    }),
    ...mapGetters([
      'conversations',
    ])
  },
  created () {
    this.icons = {
      matDelete,
      matDoneAll,
      matPause,
      matPlayArrow,
      matUpdate
    }
  },
  methods: {
    async toggleActive (active) {
      this.updatingStatus = true

      try {
        await this.$store.dispatch('updateAsset', {
          assetId: this.asset.id,
          attrs: { active: typeof active === 'boolean' ? active : !this.asset.active }
        })
        await this.$store.dispatch('fetchUserAssets')
        this.notifySuccess('notification.saved')
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
      } finally {
        this.updatingStatus = false
      }
    },
    async openConfirmDeleteDialog () {
      this.removingAsset = true

      try {
        const [
          transactions
        ] = await Promise.all([
          this.$store.dispatch('fetchTransactions', {
            userId: this.asset.ownerId,
            assetId: this.asset.id,
            asOwner: true
          }),
          this.$store.dispatch('fetchMessages')
        ])

        this.pendingTransactions = transactions.filter(transaction => {
          return !['cancelled', 'completed'].includes(transaction.status)
        })

        const conversationsByTransactionId = keyBy(this.conversations, conversation => {
          return conversation.transaction && conversation.transaction.id
        })

        const hiddenPendingTransactionsToOwner = this.pendingTransactions.filter(transaction => {
          const conversation = conversationsByTransactionId[transaction.id]
          return !conversation || conversation.isEmpty
        })

        this.showRemoveAssetWillCancelTransactionWarning = this.pendingTransactions.length &&
          this.pendingTransactions.length !== hiddenPendingTransactionsToOwner.length

        this.confirmDeleteDialogOpened = true
      } catch (err) {
        logger(err, { notification: true })
      } finally {
        this.removingAsset = false
      }
    },
    async cancelPendingTransactions () {
      if (!this.pendingTransactions.length) return

      const promises = this.pendingTransactions.map(transaction => {
        return this.$store.dispatch('createTransactionTransition', {
          transactionId: transaction.id,
          transitionName: 'cancel',
          data: {
            cancellationReason: 'refusedByOwner'
          }
        })
      })

      await Promise.all(promises)
    },
    async remove () {
      this.confirmDeleteDialogOpened = false

      try {
        this.removingAsset = true

        await this.cancelPendingTransactions()

        const assetId = this.asset.id

        await this.$store.dispatch('removeAsset', {
          assetId
        })
        this.$emit('remove', assetId)
        await this.$store.dispatch('fetchUserAssets')

        this.notifySuccess('notification.deleted')
      } catch (err) {
        logger(err, { notification: true })
      } finally {
        this.removingAsset = false
      }
    }
  }
}
</script>

<template>
  <AssetCard
    v-bind="assetCardAttributes"
  >
    <template
      v-if="status"
      v-slot:caption
    >
      <div class="absolute-full text-weight-medium text-h5 column flex-center">
        <template v-if="unavailable">
          <QIcon
            :name="icons.matDoneAll"
            size="3rem"
          />
          <AppContent
            tag="div"
            entry="asset"
            field="unavailable"
          />
        </template>
        <template v-else-if="paused">
          <QIcon
            :name="icons.matPause"
            size="3rem"
          />
          <AppContent
            tag="div"
            entry="asset"
            field="paused"
          />
        </template>
        <template v-else-if="pendingValidation">
          <QIcon
            :name="icons.matUpdate"
            size="3rem"
          />
          <AppContent
            tag="div"
            entry="asset"
            field="pending_validation"
          />
        </template>
      </div>
    </template>

    <template v-slot:bottom>
      <div
        class="row justify-end q-mt-sm q-mb-md"
        @click.prevent
      >
        <QBtn
          v-if="!unavailable"
          :loading="updatingStatus"
          :rounded="style.roundedTheme"
          color="grey-1"
          text-color="default-color"
          class="q-ma-xs"
          unelevated
          @click.stop.prevent="toggleActive"
        >
          <QIcon
            :name="paused ? icons.matPlayArrow : icons.matPause"
            :left="true"
          />
          <AppContent
            entry="asset"
            :field="paused ? 'reactivate_action' : 'pause_action'"
          />
        </QBtn>
        <QBtn
          :loading="removingAsset"
          :rounded="style.roundedTheme"
          class="q-ma-xs"
          color="grey-2"
          text-color="default-color"
          unelevated
          @click.stop.prevent="openConfirmDeleteDialog"
        >
          <QIcon :name="icons.matDelete" />
        </QBtn>

        <ConfirmDeleteDialog
          :opened="confirmDeleteDialogOpened"
          @confirm="remove"
          @cancel="confirmDeleteDialogOpened = false"
        >
          <AppContent
            v-if="showRemoveAssetWillCancelTransactionWarning"
            entry="asset"
            field="delete_listing_and_transactions_warning"
          />
          <AppContent
            v-else
            entry="asset"
            field="delete_listing_warning"
          />
        </ConfirmDeleteDialog>
      </div>
    </template>
  </AssetCard>
</template>

<style lang="stylus" scoped>
</style>

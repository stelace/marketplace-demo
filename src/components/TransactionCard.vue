<script>
import { get, values } from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { date } from 'quasar'

import SelectNumber from 'src/components/SelectNumber'

import CartMixin from 'src/modules/ecommerce/mixins/cart'

import {
  convertEndDate
} from 'src/utils/time'

import {
  getAvailableQuantityByDate
} from 'src/utils/asset'

import * as mutationTypes from 'src/store/mutation-types'

export default {
  components: {
    SelectNumber,
  },
  mixins: [
    CartMixin
  ],
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
    availabilityGraph () {
      if (!this.activeAsset) return
      return this.asset.availabilityGraphByAssetId[this.activeAsset.id]
    },
    showQuantitySelect () {
      if (!this.activeAsset) return false
      return this.activeAsset.quantity > 1
    },
    preview () {
      return this.transaction.preview
    },
    startDate () {
      return this.transaction.startDate
    },
    endDate () {
      return convertEndDate(this.transaction.endDate, { target: 'ui' })
    },
    quantity () {
      return this.transaction.quantity
    },
    nbTimeUnits () {
      if (!this.preview || !this.preview.duration) return 0

      return values(this.preview.duration)[0]
    },
    timeUnit () {
      if (!!this.preview || !this.preview.duration) return 'd'

      return Object.keys(this.preview.duration)[0]
    },
    takerFees () {
      if (!this.preview) return 0

      return this.preview.takerAmount - this.preview.value
    },
    totalPrice () {
      return this.preview.takerAmount + this.deliveryFee
    },
    deliveryFee () {
      if (!this.isEcommerceMarketplace) return 0
      else return (this.activeAsset.owner && this.activeAsset.owner.deliveryFee) || 0
    },
    ratingAverageScore () {
      return get(this.rating.ratingsStatsByAssetId, `default.${this.activeAsset.id}.avg`, 0)
    },
    nbRatings () {
      return get(this.rating.ratingsStatsByAssetId, `default.${this.activeAsset.id}.count`, 0)
    },
    isOwnerCurrentUser () {
      return this.currentUser.id === this.activeAsset.ownerId
    },
    ...mapState([
      'asset',
      'transaction',
      'rating',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'activeAsset',
      'promptTransactionDates',
      'promptTransactionQuantity',
      'validTransactionOptions',
      'maxAvailableQuantity',
      'paymentActive',
      'isEcommerceMarketplace',
    ]),
  },
  watch: {
    maxAvailableQuantity () {
      if (this.maxAvailableQuantity < this.quantity) {
        this.selectQuantity(this.maxAvailableQuantity)
      }
    }
  },
  mounted () {
    if (!this.promptTransactionDates) {
      this.fetchTransactionPreview()
    }
  },
  methods: {
    selectStartDate (startDate) {
      this.$store.commit({
        type: mutationTypes.SET_TRANSACTION_OPTIONS,
        startDate
      })

      if (this.validTransactionOptions) this.fetchTransactionPreview()
    },
    selectEndDate (endDate) {
      this.$store.commit({
        type: mutationTypes.SET_TRANSACTION_OPTIONS,
        endDate: convertEndDate(endDate, { target: 'api' })
      })

      if (this.validTransactionOptions) this.fetchTransactionPreview()
    },
    clearDates () {
      this.$store.commit({
        type: mutationTypes.SET_TRANSACTION_OPTIONS,
        startDate: null,
        endDate: null,
      })
    },
    selectQuantity (quantity) {
      this.$store.commit({
        type: mutationTypes.SET_TRANSACTION_OPTIONS,
        quantity
      })

      if (this.validTransactionOptions) this.fetchTransactionPreview()
    },
    getValidStartDates (rawDate) {
      if (!this.availabilityGraph) return false

      const today = date.startOfDate(new Date(), 'day').toISOString()
      const d = new Date(rawDate).toISOString()

      return today <= d &&
        getAvailableQuantityByDate({ availabilityGraph: this.availabilityGraph, date: d }) >= this.quantity
    },
    getValidEndDates (rawDate) {
      if (!this.availabilityGraph) return false

      const today = date.startOfDate(new Date(), 'day').toISOString()
      const d = convertEndDate(new Date(rawDate).toISOString(), { target: 'api' })

      let valid = today <= d
      if (this.startDate) {
        valid = valid &&
          this.startDate < d &&
          getAvailableQuantityByDate({
            availabilityGraph: this.availabilityGraph,
            startDate: this.startDate,
            endDate: d
          }) >= this.quantity
      } else {
        valid = valid &&
          getAvailableQuantityByDate({
            availabilityGraph: this.availabilityGraph,
            date: d
          }) >= this.quantity
      }

      return valid
    },
    resetTransactionParameters () {
      this.$store.commit(mutationTypes.SET_TRANSACTION_OPTIONS, {
        startDate: null,
        endDate: null,
        quantity: 1
      })
    },
    fetchTransactionPreview () {
      const endDate = convertEndDate(this.endDate, { target: 'api' })

      const invalidDates = this.startDate && endDate && endDate < this.startDate
      if (invalidDates) return

      this.$store.dispatch('previewTransaction', {
        assetId: this.activeAsset.id,
        startDate: this.startDate,
        endDate,
        quantity: this.quantity
      })
    },
    async addAssetToCart () {
      const endDate = this.endDate ? convertEndDate(this.endDate, { target: 'api' }) : null

      const { success } = await this.addToCart(this.activeAsset, this.quantity, {
        startDate: this.startDate,
        endDate,
      })
      if (success) {
        this.resetTransactionParameters()
        this.$router.push({ name: 'cart' })
      }
    },
  }
}
</script>

<template>
  <div class="transaction-card q-pa-md">
    <div class="q-pb-md">
      <div class="text-weight-bold">
        <AppContent
          v-if="activeAsset.assetType && activeAsset.assetType.timeBased"
          entry="pricing"
          field="price_per_time_unit_label"
          :options="{
            price: $fx(activeAsset.price),
            timeUnit: activeAsset.timeUnit
          }"
        />
        <AppContent
          v-else
          entry="pricing"
          field="price_with_currency"
          :options="{ price: $fx(activeAsset.price) }"
        />
      </div>
      <div v-if="nbRatings">
        <div class="row items-center">
          <AppRating
            class="asset-score"
            :score="ratingAverageScore"
            rating-label="default"
            :show-label="false"
            rating-class="q-mr-sm"
            readonly
            size="0.8rem"
          />
          <div class="text-weigh-bold">
            {{ nbRatings }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ratings -->

    <QSeparator />

    <div class="q-py-md transaction-card__content">
      <div
        v-if="promptTransactionDates"
        class="row justify-between"
      >
        <AppContent
          v-if="promptTransactionDates"
          tag="div"
          class="text-weight-medium"
          entry="time"
          field="calendar_prompt_date"
        />
        <AppContent
          v-if="startDate || endDate"
          class="cursor-pointer"
          entry="time"
          field="clear_dates"
          @click="clearDates"
        />

        <AppDateRangePicker
          class="q-mb-md"
          container-class="transaction-dates"
          :start-date="startDate"
          :end-date="endDate"
          :missing-end-date-meaning="$t({ id: 'time.missing_end_date_meaning' })"
          start-date-required
          end-date-required
          :get-valid-start-dates="getValidStartDates"
          :get-valid-end-dates="getValidEndDates"
          hide-calendar-icon
          hide-close-icon
          bottom-slots
          @changeStartDate="selectStartDate"
          @changeEndDate="selectEndDate"
        />
      </div>

      <AppContent
        v-if="promptTransactionQuantity"
        tag="div"
        class="text-weight-medium"
        entry="pricing"
        field="quantity"
      />

      <SelectNumber
        v-if="promptTransactionQuantity"
        :number="quantity"
        :max-number="maxAvailableQuantity"
        @change="selectQuantity"
      />

      <div
        v-if="preview && validTransactionOptions"
        :class="[promptTransactionDates || promptTransactionQuantity ? 'q-mt-md' : '']"
      >
        <div class="row q-py-sm justify-between">
          <div>
            <AppContent
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(preview.unitPrice) }"
            />
            <span v-if="promptTransactionDates">
              x
              <AppContent
                entry="time"
                field="per_time_unit"
                :options="{
                  nbUnits: nbTimeUnits,
                  timeUnit
                }"
              />
            </span>
            <span v-if="promptTransactionQuantity">
              x
              {{ preview.quantity }}
            </span>
          </div>

          <div>
            <AppContent
              v-show="$fx(preview.value) !== 0"
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(preview.value) }"
            />
            <AppContent
              v-show="$fx(preview.value) === 0"
              entry="pricing"
              field="free"
            />
          </div>
        </div>

        <QSeparator v-if="!isEcommerceMarketplace" />

        <div v-if="!isEcommerceMarketplace" class="row q-py-sm justify-between">
          <div>
            <AppContent
              entry="pricing"
              field="service_fees"
            />
          </div>

          <div>
            <AppContent
              v-show="$fx(takerFees) !== 0"
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(takerFees) }"
            />
            <AppContent
              v-show="$fx(takerFees) === 0"
              entry="pricing"
              field="free"
            />
          </div>
        </div>

        <div v-else class="row q-py-sm justify-between">
          <div>
            <AppContent
              entry="asset"
              field="delivery_fee_label"
            />
          </div>

          <div>
            <AppContent
              v-show="$fx(deliveryFee) !== 0"
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(deliveryFee) }"
            />
            <AppContent
              v-show="$fx(deliveryFee) === 0"
              entry="pricing"
              field="free"
            />
          </div>
        </div>

        <QSeparator />

        <div class="row q-py-sm justify-between text-weight-medium">
          <div>
            <AppContent
              entry="pricing"
              field="total"
            />
          </div>

          <div>
            <AppContent
              v-show="$fx(totalPrice) !== 0"
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(totalPrice) }"
            />
            <AppContent
              v-show="$fx(totalPrice) === 0"
              entry="pricing"
              field="free"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <QBtn
        v-if="isEcommerceMarketplace"
        :loading="addingToCart"
        class="full-width"
        :disabled="!validTransactionOptions || isOwnerCurrentUser || maxAvailableQuantity === 0"
        :rounded="style.roundedTheme"
        :label="$t({ id: 'cart.prompt.add_to_cart' })"
        color="secondary"
        @click="addAssetToCart"
      />
      <AppCheckoutButton v-else class="full-width" />
    </div>
  </div>
</template>

<style lang="stylus" scoped>

.transaction-card
  min-width: 20rem

.transaction-dates
  justify-content: space-between

  @media (max-width $breakpoint-sm-min)
    justify-content: center

.asset-score
  display: inline-block

</style>

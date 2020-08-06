<script>
import { mapState, mapGetters } from 'vuex'
import { matDelete } from '@quasar/extras/material-icons'
import { compact, values } from 'lodash'

import { populateAsset } from 'src/utils/asset'
import { convertEndDate } from 'src/utils/time'

import SelectNumber from 'src/components/SelectNumber'

export default {
  components: {
    SelectNumber,
  },
  props: {
    previewedTransactions: {
      type: Array,
      default: () => [],
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    order: {
      type: Object,
      default: null,
    },
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState([
      'style',
      'auth',
      'cart',
      'common',
    ]),
    ...mapGetters([
      'currentUser',
      'conversations',
      'ratingsActive',
      'getBaseImageUrl',
      'baseImageRatio',
    ]),
    readonly () {
      return Boolean(this.order)
    },
    productLines () {
      if (this.order && this.order.lines) {
        return compact(this.order.lines.map(line => {
          const transaction = line.transaction || {}
          let asset = transaction.assetSnapshot
          if (!asset) return

          asset = populateAsset({
            asset,
            usersById: {},
            categoriesById: this.common.categoriesById,
            assetTypesById: this.common.assetTypesById,
          })

          const timeBased = transaction.assetType.timeBased
          const nbTimeUnits = timeBased ? values(transaction.duration)[0] : 0

          return {
            id: asset.id,
            asset: asset,
            imageUrl: this.getBaseImageUrl(asset),
            name: asset.name,
            description: asset.description,
            quantity: transaction.quantity,
            maxQuantity: asset.quantity,
            unitPrice: transaction.unitPrice * (timeBased ? nbTimeUnits : 1),
            price: transaction.value,
            startDate: transaction.startDate ? new Date(transaction.startDate) : null,
            endDate: transaction.endDate ? new Date(convertEndDate(transaction.endDate, { target: 'ui' })) : null,
          }
        }))
      } else {
        return this.previewedTransactions.map(previewed => {
          let asset = previewed.assetSnapshot
          asset = populateAsset({
            asset,
            usersById: {},
            categoriesById: this.common.categoriesById,
            assetTypesById: this.common.assetTypesById,
          })

          const timeBased = previewed.assetType.timeBased
          const nbTimeUnits = timeBased ? values(previewed.duration)[0] : 0

          return {
            id: asset.id,
            asset: asset,
            imageUrl: this.getBaseImageUrl(asset),
            name: asset.name,
            description: asset.description,
            quantity: previewed.quantity,
            maxQuantity: asset.quantity,
            unitPrice: previewed.unitPrice * (timeBased ? nbTimeUnits : 1),
            price: previewed.value,
            startDate: previewed.startDate ? new Date(previewed.startDate) : null,
            endDate: previewed.endDate ? new Date(convertEndDate(previewed.endDate, { target: 'ui' })) : null,
          }
        })
      }
    },
    subTotalPrice () {
      return this.productLines.reduce((sum, line) => sum + line.price, 0)
    },
    totalPrice () {
      return this.subTotalPrice + this.deliveryFee
    },
  },
  watch: {
    productLines () {
      this.emitNewPrices()
    },
  },
  created () {
    this.icons = {
      matDelete,
    }
  },
  mounted () {
    this.emitNewPrices()
  },
  methods: {
    selectQuantity (asset, quantity) {
      this.$emit('change', { asset, quantity })
    },
    emitNewPrices () {
      this.$emit('updatePrice', {
        deliveryFee: this.deliveryFee,
        subTotalPrice: this.subTotalPrice,
        totalPrice: this.totalPrice,
      })
    }
  }
}
</script>

<template>
  <div class="shadow-2">
    <QList v-for="line of productLines" :key="line.assetId">
      <QItem class="product-line">
        <QItemSection class="col-2">
          <AppLink
            class="anchor-text--reset fit"
            :to="{ name: 'asset', params: { id: line.asset.id } }"
          >
            <QImg
              class="asset-image"
              :src="line.imageUrl"
              :alt="line.name"
              :ratio="baseImageRatio"
            >
              <slot name="caption" />
            </QImg>
          </AppLink>
        </QItemSection>
        <QItemSection>
          <QItemLabel lines="1">
            <AppLink
              class="anchor-text--reset asset-name text-weight-medium"
              :to="{ name: 'asset', params: { id: line.asset.id } }"
            >
              {{ line.name }}
            </AppLink>
          </QItemLabel>
          <QItemLabel
            class="text-body2 text-grey-7"
            lines="1"
          >
            <AppLink
              class="anchor-text--reset"
              :to="{ name: 'asset', params: { id: line.asset.id } }"
            >
              {{ line.description }}
            </AppLink>
          </QItemLabel>
          <QItemLabel>
            <AppLink
              class="anchor-text--reset"
              :to="{ name: 'asset', params: { id: line.asset.id } }"
            >
              <AppContent
                v-if="line.startDate && line.endDate"
                entry="time"
                field="from_start_date_to_end_date"
                :options="{ startDate: line.startDate, endDate: line.endDate }"
              />
            </AppLink>
          </QItemLabel>
        </QItemSection>
        <QItemSection class="col-3">
          <QItemLabel class="row justify-end items-center text-body1">
            <AppContent
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(line.unitPrice) }"
            />
            <span class="q-px-xs">
              x
            </span>
            <SelectNumber
              v-if="!readonly"
              class="text-body1 q-ml-xs"
              :number="line.quantity"
              :max-number="line.maxQuantity"
              dense
              @change="quantity => selectQuantity(line.asset, quantity)"
            />
            <span v-if="readonly">{{ line.quantity }}</span>
          </QItemLabel>
        </QItemSection>
        <QItemSection v-if="!readonly" side>
          <QItemLabel>
            <QBtn
              flat
              color="grey"
              text-color="grey"
              class="q-ma-xs"
              dense
              @click="() => selectQuantity(line.asset, 0)"
            >
              <QIcon :name="icons.matDelete" />
            </QBtn>
          </QItemLabel>
        </QItemSection>
      </QItem>
    </QList>
  </div>
</template>

<style lang="stylus" scoped>

.product-line
  border-bottom: 1px solid $separator-color

</style>

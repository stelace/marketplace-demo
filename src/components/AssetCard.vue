<script>
import { mapGetters, mapState } from 'vuex'
import { get, isNil, isNumber } from 'lodash'
import { mdiTruck, mdiTruckCheck } from '@quasar/extras/mdi-v5'

export default {
  props: {
    asset: { // expecting to be null when loading to show skeleton
      required: true,
      validator: a => typeof a === 'object',
    },
    to: {
      validator: (value) => {
        if (isNil(value)) return true
        return typeof value === 'string' || typeof value === 'object'
      },
      default: () => null
    },
    showRatings: {
      type: Boolean,
      default: true,
    },
    showDistance: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: true,
    },
    reloading: { // card update pending
      type: Boolean,
      default: false,
    },
    imageSizes: {
      type: String,
      // Quasar 'sm' & 'md' breakpoints
      default: '(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 20vw'
    }
  },
  data () {
    return {
      isImageLoading: true,
    }
  },
  computed: {
    categoryName () {
      const a = this.asset // cf. docs about using lodash and Vue reactivity
      return get(a, 'category.name')
    },
    distanceKm () {
      if (!this.asset || !this.asset.distance) return null

      return Math.round(this.asset.distance / 1000)
    },
    showAvailability () {
      return this.asset && this.asset.assetType && !this.asset.assetType.timeBased
    },
    isAvailable () {
      if (!this.asset) return false
      return this.asset.quantity > 0 && this.asset.active
    },
    showDeliveryFee () {
      return isNumber(this.asset.deliveryFee)
    },
    showPlaceholder () {
      const a = this.asset
      return !get(a, 'id')
    },
    imageSrcset () {
      if (!this.asset || this.reloading) return ''

      return `${
        this.getBaseImageUrl(this.asset, { width: this.smallImageWidth })
      } ${this.smallImageWidth}w, ${
        this.getBaseImageUrl(this.asset, { width: this.baseImageWidth })
      } ${this.baseImageWidth}w, ${
        this.getLargeImageUrl(this.asset)
      } ${this.largeImageWidth}w`
    },
    ...mapState([
      'content'
    ]),
    ...mapGetters([
      'baseImageRatio',
      'baseImageWidth',
      'smallImageWidth',
      'getBaseImageUrl',
      'getLargeImageUrl',
      'largeImageWidth',
      'ratingsActive',
      'isEcommerceMarketplace',
    ]),
  },
  created () {
    this.icons = {
      mdiTruck,
      mdiTruckCheck,
    }
  },
}
</script>

<template>
  <component
    :is="!!asset ? 'router-link' : 'div'"
    class="anchor-text--reset asset-card-container"
    :to="to || (!!asset ? { name: 'asset', params: { id: asset.id } } : false)"
  >
    <QCard
      :flat="flat"
      class="asset-card cursor-pointer"
    >
      <slot
        :asset="asset"
        name="image"
      >
        <div class="asset-image-container" :style="`padding-bottom: ${1 / baseImageRatio * 100}%`">
          <QSkeleton
            :class="[
              showPlaceholder || isImageLoading || reloading ? '' : 'image-skeleton--hide',
              'absolute-full image-skeleton'
            ]"
          />
          <!-- Use native lazy loading (https://web.dev/native-lazy-loading/) -->
          <img
            v-if="!!asset"
            class="asset-image"
            :src="(asset && !reloading) ? getBaseImageUrl(asset) : content.blankImageBase64"
            :srcset="imageSrcset || false"
            :alt="asset ? asset.name : ''"
            :sizes="imageSizes || false"
            loading="lazy"
            @load="isImageLoading = false"
          >
        </div>

        <div
          v-show="showDistance && typeof distanceKm === 'number'"
          class="distance-chip absolute-top-left q-mt-sm q-ml-sm q-px-sm q-py-xs text-white"
        >
          <AppContent
            entry="places"
            field="distance_value"
            :options="{ distance: distanceKm }"
          />
        </div>
      </slot>

      <QCardSection class="asset-content q-py-xs q-px-sm">
        <slot :asset="asset">
          <h2
            v-if="!showPlaceholder"
            class="text-body1 text-weight-medium q-ma-none ellipsis"
          >
            {{ asset.name }}
          </h2>
          <QSkeleton v-else type="text" class="text-body1 q-ma-none" />

          <div class="row justify-between">
            <div
              v-if="!showPlaceholder"
              class="text-subtitle2 flex-item--grow text-grey-6 ellipsis"
            >
              <AppRatingStars
                v-if="showRatings && ratingsActive"
                :target="asset"
                readonly
              />
              <div v-else>
                {{ asset.locationName }}
              </div>
            </div>
            <QSkeleton v-else type="text" class="text-subtitle2 flex-item--grow" />

            <div
              v-if="asset && asset.price"
              class="text-weight-bold text-grey-8 ellipsis"
            >
              <AppContent
                v-if="asset.assetType && asset.assetType.timeBased"
                entry="pricing"
                field="price_per_time_unit_short_label"
                :options="{
                  price: $fx(asset.price),
                  timeUnit: asset.timeUnit
                }"
              />
              <AppContent
                v-else
                entry="pricing"
                field="price_with_currency"
                :options="{ price: $fx(asset.price) }"
              />
            </div>
            <QSkeleton v-else type="text" class="text-subtitle2 flex-item--grow" />
            <!-- <h3 class="text-subtitle2 text-weight-medium text-grey-6 q-ma-none text-right ellipsis">
              {{ categoryName }}
            </h3> -->
          </div>

          <slot name="bottom" />
        </slot>
      </QCardSection>
    </QCard>
  </component>
</template>

<style lang="stylus" scoped>
.asset-card-container
  max-width: 100%

.asset-card
  max-width: 100%
  transition: all $transition-duration
  &:focus, &:hover
    transform: translateY(-5px)

// padding-bottom aspect-ratio technique (ratio is inlined in HTML)
.asset-image-container
  position: relative
  height: 0
.asset-image
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  z-index: 2 // above q-skeleton

.image-skeleton
  visibility: visible
  // Note that we have to set transform transition with different duration for focus style
  transition: visibility 5s, transform $transition-duration
  padding: 0!important // override Quasar style
  &.image-skeleton--hide
    visibility: hidden

.asset-card .asset-image
  border-radius: $generic-border-radius

.asset-ratings
  flex: 1 0

.distance-chip
  background-color: rgba(0, 0, 0, 0.4)
  border-radius: $generic-border-radius !important
</style>

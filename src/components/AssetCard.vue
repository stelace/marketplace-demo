<script>
import { mapGetters } from 'vuex'
import { get, isNil } from 'lodash'

export default {
  props: {
    asset: {
      type: Object,
      required: true
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
    }
  },
  data () {
    return {}
  },
  computed: {
    customLink () {
      return this.to
    },
    categoryName () {
      const a = this.asset // cf. docs about using lodash and Vue reactivity
      return get(a, 'category.name')
    },
    ...mapGetters([
      'baseImageRatio',
      'getBaseImageUrl',
    ])
  }
}
</script>

<template>
  <router-link
    v-if="asset.id"
    class="anchor-text--reset asset-card-container"
    :to="customLink ? to : { name: 'asset', params: { id: asset.id } }"
  >
    <QCard
      flat
      class="asset-card cursor-pointer"
    >
      <slot
        :asset="asset"
        name="image"
      >
        <QImg
          class="asset-image"
          :src="getBaseImageUrl(asset)"
          :alt="asset.name"
          :ratio="baseImageRatio"
        >
          <slot name="caption" />
        </QImg>
      </slot>

      <QCardSection class="asset-content q-py-xs q-px-sm">
        <slot :asset="asset">
          <h2 class="text-body1 text-weight-medium q-ma-none ellipsis">
            {{ asset.name }}
          </h2>
          <div class="row justify-between">
            <div class="text-subtitle2 asset-location text-grey-6 ellipsis">
              <AppRatingStars
                v-if="showRatings"
                :target="asset"
                readonly
              />
              <div v-else>
                {{ asset.locationName }}
              </div>
            </div>
            <div
              v-if="asset.price"
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
            <!-- <h3 class="text-subtitle2 text-weight-medium text-grey-6 q-ma-none text-right ellipsis">
              {{ categoryName }}
            </h3> -->
          </div>
          <slot name="bottom" />
        </slot>
      </QCardSection>
    </QCard>
  </router-link>
</template>

<style lang="stylus" scoped>
.asset-card-container
  max-width: 100%

.asset-card
  max-width: 100%
  &:focus, &:hover
    .asset-image
      transform: translateZ(0) scale(1.02)
    .asset-content
      transform: translateY(5px)

.asset-image, .asset-content
  transition: all $transition-duration

.asset-card .asset-image
  border-radius: $generic-border-radius

.asset-location
  flex: 1 0
</style>

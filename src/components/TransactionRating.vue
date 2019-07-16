<script>
import { values } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    target: {
      type: Object,
      default: () => {}
    },
    score: {
      type: Number,
      default: 0
    },
    assetName: {
      type: String,
      default: ''
    },
    duration: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    timeUnit () {
      if (!this.duration) return
      return Object.keys(this.duration)[0]
    },
    nbTimeUnits () {
      if (!this.duration) return
      return values(this.duration)[0]
    },
    ratingConfigs () {
      if (this.ratingsOptions.editOrder) {
        return this.ratingsOptions.editOrder.map(key => this.ratingsOptions.types[key])
      } else {
        return values(this.ratingsOptions.types)
      }
    },
    ...mapGetters([
      'ratingsOptions',
    ])
  },
  methods: {

  }
}
</script>

<template>
  <QCard
    flat
    class="rating-card"
  >
    <QCardSection class="rating-content row q-col-gutter-md q-py-xs q-px-sm items-center position-relative">
      <router-link
        :to="{ name: 'publicProfile', params: { id: author.id } }"
        class="anchor-text--reset col-1"
        @click.prevent
      >
        <AppAvatar :user="author" size="2rem" />
      </router-link>
      <router-link
        :to="{ name: 'publicProfile', params: { id: author.id } }"
        class="anchor-text--reset col-3"
        @click.prevent
      >
        <div class="text-weight-bold">
          {{ author.displayName }}
        </div>
        <div>
          {{ assetName }}
        </div>
      </router-link>
      <div class="col-6">
        <AppRatingStars
          :value="score"
          size="1.25rem"
          readonly
        />
      </div>
      <div class="col-2">
        <AppContent
          v-if="duration"
          entry="time"
          field="unit_label"
          :options="{
            timeUnit,
            nbTimeUnits
          }"
        />
      </div>
    </QCardSection>
  </QCard>
</template>

<style lang="stylus" scoped>

.rating-card
  width: 100%
  border-bottom: 1px solid $separator-color

</style>

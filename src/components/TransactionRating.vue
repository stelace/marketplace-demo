<script>
import { get, values, keyBy, compact } from 'lodash'
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
    averageRating: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    },
    ratings: {
      type: Array,
      default: () => []
    },
    transaction: {
      type: Object,
      default: () => {}
    },
  },
  data () {
    return {
      showDetails: false,
    }
  },
  computed: {
    assetName () {
      return get(this.transaction, 'assetSnapshot.name')
    },
    timeUnit () {
      if (!this.transaction || !this.transaction.duration) return
      return Object.keys(this.transaction.duration)[0]
    },
    nbTimeUnits () {
      if (!this.transaction || !this.transaction.duration) return
      return values(this.transaction.duration)[0]
    },
    ratingConfigs () {
      if (this.ratingsOptions.editOrder) {
        return this.ratingsOptions.editOrder.map(key => this.ratingsOptions.types[key])
      } else {
        return values(this.ratingsOptions.types)
      }
    },
    starRatings () {
      const starRatingConfigs = this.ratingConfigs.filter(ratingConfig => ratingConfig.form === 'star')

      const ratingsByLabel = keyBy(this.ratings, 'label')

      return compact(starRatingConfigs.map(ratingConfig => {
        const rating = ratingsByLabel[ratingConfig.label]
        return rating
      }))
    },
    ...mapGetters([
      'ratingsOptions',
    ])
  },
  methods: {
    async openRatingDialog () {
      const ratings = await this.$store.dispatch('fetchRatings', { transactionId: this.transaction.id })
      this.savedRatings = ratings

      this.ratingsDialogOpened = true
    },
    closeRatingDialog () {
      this.ratingsDialogOpened = false
    },
    toggleDetails () {
      this.showDetails = !this.showDetails
    }
  }
}
</script>

<template>
  <QCard
    flat
    class="rating-card cursor-pointer"
    @click="toggleDetails"
  >
    <div class="absolute-top-right">
      <QIcon
        v-show="!showDetails"
        name="expand_more"
        color="grey"
        size="1.5rem"
      />
      <QIcon
        v-show="showDetails"
        name="expand_less"
        color="grey"
        size="1.5rem"
      />
    </div>
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
          :value="averageRating"
          size="1.25rem"
          readonly
        />
        <AppRating
          class="q-mt-sm"
          rating-label="completionScore"
          :score="score"
          dense
        />
      </div>
      <div class="col-2">
        <AppContent
          v-if="transaction.duration"
          entry="time"
          field="unit_label"
          :options="{
            timeUnit,
            nbTimeUnits
          }"
        />
      </div>
    </QCardSection>
    <QSlideTransition>
      <QCardSection v-show="showDetails" class="rating-details-content row q-col-gutter-md items-center">
        <div class="col-4" />
        <div class="col-6">
          <AppRating
            v-for="rating in starRatings"
            :key="rating.label"
            :rating-label="rating.label"
            :score="rating.score"
            size="0.8rem"
          />
        </div>
      </QCardSection>
    </QSlideTransition>
  </QCard>
</template>

<style lang="stylus" scoped>

.rating-card
  width: 100%
  border-bottom: 1px solid $separator-color

  &:hover
    background-color: #EEE

</style>

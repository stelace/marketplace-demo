<script>
import { get, sortBy } from 'lodash'
import { mapGetters, mapState } from 'vuex'
import { convertApiToDisplayScore } from 'src/utils/rating'

import TransactionRating from 'src/components/TransactionRating'

export default {
  components: {
    TransactionRating,
  },
  props: {
    ratings: {
      type: Array,
      required: true
    },
    target: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    transformedRatings () {
      return this.sortRatings(this.ratings).map(this.populateScore)
    },
    isCurrentUser () {
      return this.target && this.target.id === this.currentUser.id
    },
    ...mapState([
      'style',
    ]),
    ...mapGetters([
      'ratingsOptions',
      'currentUser',
    ])
  },
  methods: {
    sortRatings (ratings) {
      return sortBy(ratings, rating => rating.createdDate).reverse()
    },
    populateScore (rating) {
      const score = convertApiToDisplayScore(
        rating.apiScore,
        { displayMaxScore: get(this.ratingsOptions, 'stats.default.maxScore') }
      )

      return Object.assign({ score }, rating)
    }
  },
}
</script>

<template>
  <div class="transaction-ratings-list">
    <div class="row justify-between items-center q-px-sm">
      <slot name="title">
        <AppContent
          tag="h2"
          class="text-h4 text-weight-medium"
          entry="rating"
          field="my_ratings"
        />
      </slot>
    </div>

    <div v-if="transformedRatings.length" class="relative-position">
      <QCard class="transaction-ratings-container">
        <TransactionRating
          v-for="rating of transformedRatings"
          :key="rating.transactionId"
          class="q-pa-md"
          :author="rating.owner"
          :target="target"
          :score="rating.score"
          :asset-name="rating.assetName"
          :duration="rating.transactionDuration"
        />
      </QCard>
    </div>
    <div v-else class="text-center">
      <AppContent
        entry="rating"
        field="no_rating_message"
        :options="{ isCurrentUser }"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>

.transaction-ratings-container.app--blur
  min-height: 10rem // enough space to show the CTA message

.transaction-ratings-overlay
  background-color: rgba(0, 0, 0, .47)
  color: #FFF
  text-decoration: none

</style>

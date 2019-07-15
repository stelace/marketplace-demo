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
    ratingsStats: {
      type: Array,
      required: true
    },
    target: {
      type: Object,
      default: () => {}
    },
    showCta: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    transformedRatingsStats () {
      let ratingsStats = this.sortRatingsStats(this.ratingsStats)
      ratingsStats = this.populateScores(ratingsStats)

      if (this.showCta) {
        // do not show a too large area of blur for CTA
        return ratingsStats.slice(0, 3)
      } else {
        return ratingsStats
      }
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
    sortRatingsStats (ratingsStats) {
      return sortBy(ratingsStats, ratingStat => {
        const createdDate = get(ratingStat, 'transaction.createdDate')
        return createdDate
      }).reverse()
    },
    populateScores (ratingsStats) {
      return ratingsStats.map(ratingStat => {
        const defaultAvgScore = get(ratingStat, 'stats.default.avg', 0)
        const completionAvgScore = get(ratingStat, 'stats.completionScore.avg', 0)

        const averageRating = convertApiToDisplayScore(
          defaultAvgScore,
          { displayMaxScore: get(this.ratingsOptions, 'stats.default.maxScore') }
        )
        const score = convertApiToDisplayScore(
          completionAvgScore,
          { displayMaxScore: get(this.ratingsOptions, 'stats.completionScore.maxScore') }
        )

        return Object.assign({}, ratingStat, {
          averageRating,
          score
        })
      })
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

    <div v-if="transformedRatingsStats.length" class="relative-position">
      <QCard class="transaction-ratings-container">
        <TransactionRating
          v-for="ratingStat of transformedRatingsStats"
          :key="ratingStat.transactionId"
          class="q-pa-md"
          :transaction="ratingStat.transaction"
          :author="ratingStat.owner"
          :target="target"
          :average-rating="ratingStat.averageRating"
          :score="ratingStat.score"
          :ratings="ratingStat.ratings"
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

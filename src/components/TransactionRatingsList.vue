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
    showAssetName: {
      type: Boolean,
      default: true
    },
    filterOnAsset: {
      type: Boolean,
      default: false
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
        rating.score,
        { displayMaxScore: get(this.ratingsOptions, 'stats.default.maxScore') }
      )

      return Object.assign({}, rating, {
        score,
        assetName: get(rating, 'metadata.assetName')
      })
    }
  },
}
</script>

<template>
  <div class="transaction-ratings-list">
    <div class="row justify-between items-center">
      <slot name="title">
        <AppContent
          tag="h2"
          class="text-h4 text-weight-medium"
          entry="rating"
          field="ratings_label"
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
          :comment="rating.comment"
          :date="rating.createdDate"
          :show-asset-name="showAssetName"
        />
      </QCard>
    </div>
    <div v-else class="text-center">
      <AppContent
        v-if="filterOnAsset"
        entry="rating"
        field="no_asset_rating_message"
        :options="{ isOwnAsset: isCurrentUser }"
      />
      <AppContent
        v-else
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

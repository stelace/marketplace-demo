<script>
import { isValidDateString } from 'src/utils/time'

export default {
  props: {
    author: {
      type: Object,
      default: () => {}
    },
    score: {
      type: Number,
      default: 0
    },
    date: {
      type: String,
      default: null
    },
    assetName: {
      type: String,
      default: ''
    },
    comment: {
      type: String,
      default: null,
    },
    showAssetName: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    ratingDate () {
      if (!this.date || !isValidDateString(this.date)) return null
      return new Date(this.date)
    },
  },
}
</script>

<template>
  <QCard
    flat
    class="rating-card"
  >
    <QCardSection class="rating-content q-col-gutter-md q-py-xs q-px-sm position-relative">
      <div class="row items-center">
        <router-link
          :to="{ name: 'publicProfile', params: { id: author.id } }"
          class="anchor-text--reset col-1"
          @click.prevent
        >
          <AppAvatar :user="author" size="2rem" />
        </router-link>
        <div class="col-3">
          <router-link
            :to="{ name: 'publicProfile', params: { id: author.id } }"
            class="anchor-text--reset"
            @click.prevent
          >
            <div class="text-weight-bold">
              {{ author.displayName }}
            </div>
          </router-link>
          <AppContent
            v-if="ratingDate"
            entry="time"
            field="date_fullmonth"
            :options="{ date: ratingDate }"
          />
        </div>
        <div class="col-8">
          <div v-show="showAssetName && assetName">
            {{ assetName }}
          </div>
          <AppRatingStars
            :value="score"
            size="1rem"
            readonly
          />
        </div>
      </div>
      <div v-if="comment" class="row">
        <div>{{ comment }}</div>
      </div>
    </QCardSection>
  </QCard>
</template>

<style lang="stylus" scoped>

.rating-card
  width: 100%
  border-bottom: 1px solid $separator-color

</style>

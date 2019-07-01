<template>
  <q-dialog
    ref="ratingDialog"
    :value="opened"
    :maximized="$q.screen.lt.sm"
    persistent
    transition-show="slide-top"
    transition-hide="slide-bottom"
    @show="onOpenDialog"
    @hide="closeDialog"
  >
    <q-card class="q-pa-md rating-card">
      <q-card-section class="text-center">
        <q-btn
          flat
          :rounded="style.roundedTheme"
          color="primary"
          class="absolute-top-right"
          label="X"
          @click="closeDialog"
        />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-4">
            <div class="row">
              <q-item-section avatar>
                <AppAvatar :user="target" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ target.displayName }}
                </q-item-label>
                <AppRatingStars
                  v-if="typeof target.averageRating === 'number'"
                  :target="target"
                  readonly
                />
                <div class="row">
                  <div class="col-8">
                    <AppRatingSlider
                      v-if="typeof target.score === 'number'"
                      color="secondary"
                      label
                      label-color="secondary"
                      :value="target.score"
                      readonly
                    />
                  </div>
                </div>
              </q-item-section>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="lt-md q-mt-md" />
            <div class="row q-mb-md text-weight-medium">
              {{ assetName }}
            </div>
            <div
              v-for="ratingConfig in ratingConfigs"
              :key="ratingConfig.label"
            >
              <AppRating
                :class="[ratingConfig.form !== 'star' ? 'q-mt-md' : '']"
                :rating-label="ratingConfig.label"
                :score="editingRatingsScores[ratingConfig.label]"
                :readonly="readonly || (!readonly && !canEditRatingByLabel[ratingConfig.label] && !isSaving)"
                :target-name="target.displayName"
                size="0.8rem"
                @init="score => changeScore(ratingConfig.label, score)"
                @change="score => changeScore(ratingConfig.label, score)"
              />
            </div>
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col-12 col-md-10" />
          <div class="col-12 col-md-2 flex justify-end items-end">
            <div class="items-end">
              <QBtn
                v-if="!readonly"
                :disabled="saveButtonDisabled"
                :loading="isSaving"
                :rounded="style.roundedTheme"
                color="primary"
                @click="save"
              >
                <AppContent
                  entry="prompt"
                  field="save_button"
                />
              </QBtn>
              <QBtn
                v-else
                color="primary"
                :rounded="style.roundedTheme"
                @click="closeDialog"
              >
                <AppContent
                  entry="navigation"
                  field="close"
                />
              </QBtn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { get, keyBy, values, compact, isNil } from 'lodash'
import { mapState, mapGetters } from 'vuex'

import {
  isRatingOptional,
} from 'src/utils/rating'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    author: {
      type: Object,
      default: () => {},
      required: true
    },
    target: {
      type: Object,
      default: () => {},
      required: true
    },
    transaction: {
      type: Object,
      default: () => {},
      required: true
    },
    savedRatings: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      editingRatingsScores: {},
      ratingConfigs: [],
      isSaving: false,
    }
  },
  computed: {
    ...mapState([
      'auth',
      'style',
    ]),
    ...mapGetters([
      'ratingsOptions',
    ]),
    assetName () {
      return get(this.transaction, 'assetSnapshot.name')
    },
    savedRatingsByLabel () {
      return keyBy(this.savedRatings, 'label')
    },
    canEditRatingByLabel () {
      if (!this.ratingConfigs.length) return {}

      const canEditRatingByLabel = {}

      this.ratingConfigs.forEach(ratingConfig => {
        canEditRatingByLabel[ratingConfig.label] = !this.savedRatingsByLabel[ratingConfig.label]
      })

      return canEditRatingByLabel
    },
    saveButtonDisabled () {
      if (this.readonly) return true

      return this.ratingConfigs.some(ratingConfig => {
        const label = ratingConfig.label
        const isOptional = isRatingOptional(ratingConfig)
        const needSave = !!this.canEditRatingByLabel[label]
        const hasValue = !isNil(this.editingRatingsScores[label])

        return needSave && !isOptional && !hasValue
      })
    },
  },
  methods: {
    async save () {
      this.isSaving = true

      try {
        const promises = []

        let nbRequiredRatingsToSave = 0

        this.ratingConfigs.forEach(ratingConfig => {
          const label = ratingConfig.label
          const needSave = !!this.canEditRatingByLabel[label]

          if (needSave) {
            const isOptional = isRatingOptional(ratingConfig)
            if (!isOptional) {
              nbRequiredRatingsToSave += 1
            }

            const skipSave = isNil(this.editingRatingsScores[label])
            if (skipSave) return

            const promise = this.$store.dispatch('createRating', {
              attrs: {
                score: this.editingRatingsScores[label],
                authorId: this.author.id,
                targetId: this.target.id,
                transactionId: this.transaction.id,
                label
              }
            }).catch(() => null) // handle the error so we know which ratings is successfully saved
            promises.push(promise)
          }
        })

        const results = await Promise.all(promises)
        const newlySavedRatings = compact(results)

        const partialSave = nbRequiredRatingsToSave > newlySavedRatings.length

        if (partialSave) {
          this.notifyWarning('error.unknown_happened_header')
          this.$emit('partial-save', newlySavedRatings)
        } else {
          this.notifySuccess('notification.saved')
          this.$emit('save')
          this.closeDialog()
        }
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
      } finally {
        this.isSaving = false
      }
    },
    changeScore (label, score) {
      this.editingRatingsScores = Object.assign({}, this.editingRatingsScores, {
        [label]: score
      })
    },

    onOpenDialog () {
      if (this.ratingsOptions.editOrder) {
        this.ratingConfigs = this.ratingsOptions.editOrder.map(key => this.ratingsOptions.types[key])
      } else {
        this.ratingConfigs = values(this.ratingsOptions.types)
      }

      this.ratingConfigs.forEach(ratingConfig => {
        if (this.savedRatingsByLabel[ratingConfig.label]) {
          this.editingRatingsScores[ratingConfig.label] = this.savedRatingsByLabel[ratingConfig.label].score
        }
      })
    },
    closeDialog () {
      this.$emit('close')
    },
    shake () {
      this.$refs.ratingDialog.shake()
    }
  }
}
</script>

<style lang="stylus" scoped>
.rating-card
  min-width: 20rem

  @media (min-width $breakpoint-sm-min)
    min-width: 30rem

  @media (min-width $breakpoint-md-min)
    min-width: 40rem

.rating-card .error-message
  color: $negative
</style>

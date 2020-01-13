<script>
import { isNil, isUndefined } from 'lodash'
import { mapGetters } from 'vuex'
import { matCheck, matClose } from '@quasar/extras/material-icons'

import { convertApiToDisplayScore, convertDisplayToApiScore } from 'src/utils/rating'

const defaultRatingConfig = {
  maxScore: 5,
  form: 'star',
}

const defaultBooleanChoices = [
  { value: true, score: 100 },
  { value: false, score: 0 },
]

export default {
  props: {
    ratingLabel: {
      type: String,
      required: true
    },
    isStats: { // will check on stats rating config, will automatically set readonly to true
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: undefined
    },
    readonly: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: 'secondary'
    },
    size: {
      type: String,
      default: '1rem'
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    containerClass: {
      type: String,
      default: ''
    },
    labelClass: {
      type: String,
      default: ''
    },
    ratingClass: {
      type: String,
      default: ''
    },
    dense: { // usable only if readonly, display an icon instead of checkbox or radio buttons for boolean type
      type: Boolean,
      default: false
    },
    targetName: { // name that can be used in label translation
      type: String,
      default: undefined
    }
  },
  computed: {
    ...mapGetters([
      'ratingsOptions'
    ]),
    isReadonly () {
      if (this.isStats) return true
      return this.readonly
    },
    defaultScore () {
      const defaultDisplayScore = !isUndefined(this.ratingConfig.defaultScore)
        ? this.ratingConfig.defaultScore
        : this.ratingConfig.maxScore

      return convertDisplayToApiScore(defaultDisplayScore, { displayMaxScore: this.ratingConfig.maxScore })
    },
    ratingConfig () {
      let ratingConfig
      if (this.isStats) {
        ratingConfig = this.ratingsOptions.stats[this.ratingLabel]
      } else {
        ratingConfig = this.ratingsOptions.types[this.ratingLabel]
      }

      return ratingConfig || defaultRatingConfig
    },
    displayScore () {
      const score = !isUndefined(this.score) ? this.score : this.defaultScore
      return convertApiToDisplayScore(score, { displayMaxScore: this.ratingConfig.maxScore })
    },
    isUniqueChoice () {
      return this.ratingConfig.choices && this.ratingConfig.choices.length === 1
    },
    uniqueChoiceValue () {
      if (!this.isUniqueChoice) return null
      return this.ratingConfig.choices[0].value
    },
    trueValueScore () {
      const choices = this.ratingConfig.choices || defaultBooleanChoices

      const choice = choices.find(c => c.value === true)
      if (!choice) return null

      return choice.score
    },
    falseValueScore () {
      const choices = this.ratingConfig.choices || defaultBooleanChoices

      const choice = choices.find(c => c.value === false)
      if (!choice) return null

      return choice.score
    },
    sameColumnWidth () {
      return this.ratingConfig.form === 'star'
    },
    displayRow () {
      if (this.ratingConfig.form === 'star') return true
      return this.readonly && this.dense
    }
  },
  mounted () {
    const score = !isUndefined(this.score) ? this.score : this.defaultScore

    this.$emit('init', score)
  },
  created () {
    this.icons = {
      matCheck,
      matClose
    }
  },
  methods: {
    changeScore (displayScore) {
      if (this.isReadonly) return

      let score
      if (isNil(displayScore)) {
        score = null
      } else {
        score = convertDisplayToApiScore(displayScore, { displayMaxScore: this.ratingConfig.maxScore })
      }

      this.$emit('change', score)
    },
  }
}
</script>

<template>
  <div
    :class="[
      displayRow ? 'row' : '',
      containerClass
    ]"
  >
    <div
      v-if="showLabel && !isStats"
      :class="[
        labelClass || (sameColumnWidth ? 'col-5' : '')
      ]"
    >
      <AppContent
        entry="rating"
        :field="`labels.${ratingConfig.label}`"
        :options="{ name: targetName }"
      />
    </div>
    <div
      :class="[
        ratingClass || (sameColumnWidth ? 'col-7' : '')
      ]"
    >
      <AppRatingStars
        v-if="ratingConfig.form === 'star'"
        :value="displayScore"
        :max="ratingConfig.maxScore"
        :size="size"
        :readonly="isReadonly"
        @input="displayScore => changeScore(displayScore)"
      />

      <AppRatingSlider
        v-if="ratingConfig.form === 'slider'"
        :value="displayScore"
        snap
        :color="color"
        label
        :label-color="color"
        :min="0"
        :max="ratingConfig.maxScore"
        :step="10"
        :readonly="isReadonly"
        @input="displayScore => changeScore(displayScore)"
      />

      <div v-if="ratingConfig.form === 'boolean'">
        <div v-if="!dense">
          <div
            v-if="isUniqueChoice"
            class="row"
          >
            <QCheckbox
              :value="displayScore || null"
              :indeterminate-value="0"
              :true-value="uniqueChoiceValue === true ? trueValueScore : null"
              :false-value="uniqueChoiceValue === false ? falseValueScore : null"
              :color="color"
              @input="displayScore => changeScore(displayScore)"
            >
              <AppContent
                v-if="uniqueChoiceValue === true"
                entry="prompt"
                field="binary_yes"
              />
              <AppContent
                v-if="uniqueChoiceValue === false"
                entry="prompt"
                field="binary_no"
              />
            </QCheckbox>
          </div>
          <div v-else class="row">
            <QRadio
              :value="displayScore"
              :val="trueValueScore"
              :color="color"
              @input="displayScore => changeScore(displayScore)"
            >
              <AppContent
                entry="prompt"
                field="binary_yes"
              />
            </QRadio>
            <QRadio
              class="q-ml-lg"
              :value="displayScore"
              :val="falseValueScore"
              :color="color"
              @input="displayScore => changeScore(displayScore)"
            >
              <AppContent
                entry="prompt"
                field="binary_no"
              />
            </QRadio>
          </div>
        </div>
        <div v-else class="q-ml-sm">
          <QIcon
            v-if="score === trueValueScore"
            :name="icons.matCheck"
            color="positive"
            class="text-weight-bold"
          />
          <QIcon
            v-if="score === falseValueScore"
            :name="icons.matClose"
            color="negative"
            class="text-weight-bold"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>

</style>

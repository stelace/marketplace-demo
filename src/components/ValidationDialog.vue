<template>
  <q-dialog
    ref="validationDialog"
    :value="opened"
    :maximized="$q.screen.lt.sm"
    persistent
    transition-show="slide-top"
    transition-hide="slide-bottom"
    @show="onOpen"
    @hide="onClose"
  >
    <q-card class="q-pa-md validation-card">
      <q-card-section class="text-center">
        <q-btn
          flat
          :rounded="style.roundedTheme"
          color="primary"
          class="absolute-top-right"
          label="X"
          @click="onClose"
        />
      </q-card-section>
      <slot
        v-if="stepNum === 1"
        name="step1"
        :go-back="goBack"
        :go-next="goNext"
        :shake="shake"
      />
      <slot
        v-if="stepNum === 2"
        name="step2"
        :go-back="goBack"
        :go-next="goNext"
        :shake="shake"
      />
      <slot
        v-if="stepNum === 3"
        name="step3"
        :go-back="goBack"
        :go-next="goNext"
        :shake="shake"
      />
      <slot
        v-if="stepNum === 4"
        name="step4"
        :go-back="goBack"
        :go-next="goNext"
        :shake="shake"
      />
      <slot
        v-if="stepNum === 5"
        name="step5"
        :go-back="goBack"
        :go-next="goNext"
        :shake="shake"
      />
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false
    },
    nbSteps: {
      type: Number,
      default: 1,
      required: true
    },
  },
  data () {
    return {
      stepNum: 1,
    }
  },
  computed: {
    ...mapState([
      'style',
    ]),
    finished () {
      return this.nbSteps <= this.stepNum
    }
  },
  methods: {
    reset () {
      this.stepNum = 1
    },
    onOpen () {
      this.reset()

      this.$emit('open')
      this.changeStep()
    },
    onClose () {
      this.reset()
      this.$emit('close')
    },
    goBack () {
      if (this.stepNum > 1) {
        this.stepNum -= 1

        this.changeStep()
      }
    },
    goNext () {
      if (this.finished) {
        this.onClose()
      } else {
        this.stepNum += 1
        this.changeStep()
      }
    },
    changeStep () {
      this.$emit('change-step', this.stepNum)
    },
    shake () {
      this.$refs.validationDialog.shake()
    },
  }
}
</script>

<style lang="stylus">
.validation-card
  min-width: 20rem

.validation-card .q-card__section
  @media (min-width $breakpoint-sm-min)
    max-width: 20rem

.validation-card .error-message
  color: $negative
</style>

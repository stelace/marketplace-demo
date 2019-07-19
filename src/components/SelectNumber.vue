<template>
  <QSelect
    ref="select"
    class="stl-select-number"
    v-bind="$attrs"
    :value="number"
    :options="numbers"
    @input="nb => selectNumber(nb)"
    @keyup.down.native="focusChanged"
    @keyup.up.native="focusChanged"
    @keyup.enter.native="onEnter"
  />
</template>

<script>
import { times } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  props: {
    number: {
      type: Number,
      default: 1
    },
    maxNumber: {
      type: Number,
      default: 20
    }
  },
  data () {
    return {
      optionFocused: -1,
    }
  },
  computed: {
    optionIndex () {
      if (!this.$refs.select) return -1 // before rendering

      return this.$refs.select.optionIndex
    },
    numbers () {
      return times(this.maxNumber, Number).map(nb => nb + 1)
    },
    ...mapGetters([
      'activeNumbers'
    ])
  },
  methods: {
    selectNumber (number) {
      this.$emit('change', number)
    },
    onEnter () {
      this.selectNumber(this.optionFocused > 0 ? this.filteredNumbers[this.optionFocused] : this.filteredNumbers[0])
      // Keep optionFocused value in case Enter key is pressed again
    },
    focusChanged () { // TODO: submit a PR to quasar to expose focus or a method to get it
      // like setOptionIndex in current code
      // https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/QSelect.js#L297
      this.optionFocused = this.optionIndex
    },
  }
}

</script>

<style lang="stylus">
// Fix quasar initial positionning probably due to this wrapper
// https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/select-menu-position.js#L51
.stl-select-number .q-local-menu
  top: 100%

</style>

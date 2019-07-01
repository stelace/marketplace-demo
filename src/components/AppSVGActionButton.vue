<template>
  <q-btn
    class="q-pa-sm svg-button"
    :aria-label="ariaLabel"
    :rounded="true"
    :color="color"
    :size="size"
    @click="$emit('click')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg"
      version="1.1"
      height="35"
      width="35"
      viewBox="0 0 1000 1000"
      xml:space="preserve"
    >
      <path
        fill="currentColor"
        d="M501.43 150.59 75 849.41 254.18 849.41 254.17 833.28C254.17 831.22 254.17 829.14 254.17 827.09L254.18 812.65 239.83 811.06C239.83 811.06 237.9 810.8 235.9 810.45 235.9 810.44 235.94 810.33 235.94 810.32L236.1 810.1 501.23 382.26 575.03 504.01 575.14 504.18C617.03 569.54 624.08 595.94 762.12 810.37 762.14 810.39 762.2 810.59 762.27 810.77 761.63 810.85 761.28 810.96 760.28 810.96L744.16 810.96 744.16 849.41 925 849.41 501.43 150.59Z"
      />
    </svg>
  </q-btn>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'md',
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {}
  },
  computed: {
    ariaLabel () {
      return this.label || this.$t({ id: 'navigation.search' })
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>

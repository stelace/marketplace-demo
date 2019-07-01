<script>
import { get } from 'lodash'

export default {
  props: {
    value: { // overrides target ratings
      type: Number,
      default: null
    },
    target: { // can be single asset or user
      type: Object,
      default: () => ({})
    },
    size: {
      type: String,
      default: '0.75rem'
    }
  },
  data () {
    return {}
  },
  computed: {
    rating () {
      const t = this.target // reference to target needed for vue reactivity, not available when
      // enclosed in lodash as below
      if (Number.isFinite(this.value)) return this.value
      if (Number.isFinite(get(t, 'averageRating'))) return get(t, 'averageRating')
      if (Number.isFinite(get(t, 'owner.averageRating'))) return get(t, 'owner.averageRating')
      return null
    }
  }
}
</script>

<template>
  <QRating
    :class="!Number.isFinite(rating) ? 'invisible' : ''"
    :value="rating || 0"
    :size="size"
    color="secondary"
    icon="star"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

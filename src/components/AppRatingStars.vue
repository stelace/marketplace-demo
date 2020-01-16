<script>
import { get } from 'lodash'
import { matStar } from '@quasar/extras/material-icons'

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
    },
    ownerRating: { // use owner ratings' score, useful to not fallback to owner scoring in asset card
      type: Boolean,
      default: false
    },
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
      if (this.ownerRating && Number.isFinite(get(t, 'owner.averageRating'))) return get(t, 'owner.averageRating')
      return null
    }
  },
  created () {
    this.icons = { matStar }
  },
}
</script>

<template>
  <QRating
    :class="!Number.isFinite(rating) ? 'invisible' : ''"
    :value="rating || 0"
    :size="size"
    color="secondary"
    :icon="icons.matStar"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

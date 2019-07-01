<script>
import { mapGetters } from 'vuex'
import { get } from 'lodash'

export default {
  props: {
    user: { // has precedence over url
      type: Object,
      default: null
    },
    url: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '3rem'
    },
    placeholderBackgroundClass: {
      type: String,
      default: 'bg-grey'
    },
    placeholder: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    showHoverPlaceholder: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
    }
  },
  computed: {
    hasAvatar () {
      return !!this.avatarUrl
    },
    avatarLabel () {
      return this.label || (this.user ? this.user.displayName : 'Avatar')
    },
    avatarUrl () {
      return this.user ? this.getAvatarImageUrl(this.user) : this.url
    },
    avatarPlaceholder () {
      return this.placeholder || (this.user ? this.displayNameInitial() : '')
    },
    ...mapGetters([
      'getAvatarImageUrl'
    ])
  },
  methods: {
    displayNameInitial () {
      return get(this.user, 'displayName[0]')
    },
  }
}
</script>

<template>
  <QAvatar
    :class="['avatar-anchor', hasAvatar ? '' : placeholderBackgroundClass]"
    :size="size"
  >
    <slot>
      <div
        v-if="!hasAvatar"
        class="text-white text-weight-medium non-selectable"
        :aria-label="avatarLabel"
      >
        {{ avatarPlaceholder }}
      </div>
    </slot>
    <img
      v-if="hasAvatar"
      :src="avatarUrl"
      :alt="avatarLabel"
    >

    <div
      v-if="showHoverPlaceholder"
      class="absolute-full flex flex-center avatar-placeholder bg-primary"
    >
      <slot name="hover-placeholder" />
    </div>
  </QAvatar>
</template>

<style lang="stylus" scoped>
.avatar-placeholder
  border-radius 50%
  background $dimmed-background
  transition opacity ease $transition-duration
  opacity 0
  &.avatar-placeholder--show
    opacity: 0.9

.avatar-anchor
  &:focus, &:hover
    .avatar-placeholder
      opacity 0.9
</style>

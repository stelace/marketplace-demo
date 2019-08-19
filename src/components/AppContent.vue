<script>
import { mapGetters, mapState } from 'vuex'
import { isPlainObject, isEmpty } from 'lodash'

import EventBus from 'src/utils/event-bus'

import * as mutationTypes from 'src/store/mutation-types'

export default {
  props: {
    entry: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    defaultMessage: {
      type: String,
      default: ''
    },
    tag: { // forced to 'div' when rendering HTML
      type: String,
      default: 'span'
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {}
  },
  computed: {
    contentKey () {
      return `${this.entry}.${this.field}`
    },
    value () {
      const messageDescriptor = { id: this.contentKey }
      if (this.defaultMessage) messageDescriptor.defaultMessage = this.defaultMessage

      return this.$t(messageDescriptor, this.options)
    },
    contentEditing () {
      return this.content.contentEditing
    },
    renderAsHTML () {
      return this.getContentTransformType(this.contentKey) === 'markdown'
    },
    ...mapState([
      'content',
    ]),
    ...mapGetters([
      'getContentTransformType',
      'getRawContent',
    ])
  },
  methods: {
    onClick (event) {
      // click event should not be propagated if content editing is enabled
      if (!this.contentEditing) return
      if (event) {
        event.stopPropagation()
        event.preventDefault()
      }

      this.selectEntry()
    },
    selectEntry () {
      const rawValue = this.getRawContent(this.contentKey)

      const payload = {
        type: 'stelaceContentSelected',
        entry: this.entry,
        field: this.field,
        value: this.value,
        rawValue: rawValue,
        transform: this.getContentTransformType(this.contentKey)
      }

      if (isPlainObject(this.options) && !isEmpty(this.options)) {
        payload.options = this.options
      }

      this.$store.commit({
        type: mutationTypes.SELECT_ENTRY,
        entry: this.entry,
        field: this.field
      })

      EventBus.$emit('postContentMessage', payload)
    },
  }
}
</script>

<template>
  <!--
    SECURITY WARNING: XSS attacks
    Please note v-html below is only safe to use with trusted content:
    - value is NOT user-content but content authored by your team or trusted translators
    - value was sanitized or rendered in an inherently safe way as it is in this template,
      since we keep markdown-it `html` option disabled and only render markdown syntax,
      so that existing HTML is escaped anyway.
      https://github.com/markdown-it/markdown-it/blob/master/docs/security.md
  -->
  <!-- eslint-disable vue/no-v-html -->
  <!--
    Remove all listeners if content editing is enabled
    to prevent navigation when selecting an AppContent component
  -->
  <div
    is="div"
    v-if="renderAsHTML"
    :class="[
      'stl-content-entry',
      contentEditing ? 'editable' : ''
    ]"
    :stl-content-entry="contentEditing ? entry : false"
    :stl-content-field="contentEditing ? field : false"
    v-bind="$attrs"
    @click="onClick($event)"
    v-on="contentEditing ? null : $listeners"
    v-html="value"
  />
  <!-- eslint-enable vue/no-v-html -->
  <component
    :is="tag"
    v-else
    :class="[
      'stl-content-entry',
      contentEditing ? 'editable' : ''
    ]"
    :stl-content-entry="contentEditing ? entry : false"
    :stl-content-field="contentEditing ? field : false"
    v-bind="$attrs"
    @click="onClick($event)"
    v-on="contentEditing ? null : $listeners"
  >
    {{ value }}
  </component>
</template>

<style lang="stylus">
// rendered markdown is wrapped in p tag
.stl-content-entry p
  margin-bottom: 0

.stl-content-entry a
  color: inherit
  text-decoration: none
  &:focus, &:hover
    text-decoration: underline

.stl-content-entry.editable
  background: rgba($primary, 0.4)
  border: 2px dashed #FFF
  min-height: 1em
  min-width: 2em
  cursor: pointer
  border-radius: 5px
  padding-left: 0.25em
  padding-right: 0.25em

</style>

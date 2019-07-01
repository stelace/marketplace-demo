<script>
import { mapState } from 'vuex'

export default {
  props: {
    tag: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    },
    value: {
      type: [Number, String],
      default: ''
    },
    inputType: {
      type: String,
      default: 'text' // cf. Quasar Docs https://v1.quasar-framework.org/vue-components/input
    },
    inputLabel: {
      type: String,
      default: ''
    },
    inputCounter: {
      type: Boolean,
      default: false
    },
    allowFalsySave: { // Allow user to reset content value
      type: Boolean,
      default: false
    },
    customSave: { // useful to bypass event $emit if needed
      // For instance, we need to use generated updateAssetFn per content type in Asset page
      // rather than plain methods
      type: Function,
      default: () => {}
    }
  },
  data () {
    return {
      content: this.value,
      forceIconInDev: this.$stlDebugStyles // To make sure the icon fits everywhere
    }
  },
  computed: {
    hasTextarea () {
      return this.inputType === 'textarea'
    },
    ...mapState([
      'style'
    ])
  },
  watch: {
    value () {
      this.content = this.value
    }
  },
  methods: {
    save (...args) {
      this.customSave(...args)
      this.$emit('save', ...args)
    },
    cancel (...args) {
      this.$emit('cancel', ...args)
    },
    // Allows to safely mutate content from the outside (scoped slot)
    saveDraft (value) {
      this.content = value
    },
    // overriding quasar buttons
    popupSetContent () { this.$refs.popupEdit.set() },
    popupCancelContent () { this.$refs.popupEdit.cancel() }
  }
}
</script>

<template>
  <component
    :is="tag || 'div'"
    :class="[
      'switchable-editor-container',
      active ? '-active' : ''
    ]"
    tabindex="0"
  >
    <QIcon
      v-show="active || forceIconInDev"
      :size="hasTextarea ? '1.25em' : '1em'"
      :class="[
        'absolute switchable-editor-icon',
        forceIconInDev && !active ? '-DEV-ENV-DEBUG-STYLES' : ''
      ]"
      name="edit"
      aria-hidden
    />

    <!-- Default slot for "public" content -->
    <slot :display="{ content }">
      <p
        v-if="hasTextarea"
        class="preserve-lines"
      >
        {{ content }}
      </p>
      <template v-else>
        {{ content }}
      </template>
    </slot>

    <slot
      v-if="active && !content"
      name="placeholder"
    >
      <span class="switchable-editor-placeholder">
        {{ inputLabel }}
      </span>
    </slot>

    <QPopupEdit
      v-if="active"
      ref="popupEdit"
      v-model="content"
      :label-set="$t({ id: 'prompt.save_button' })"
      @save="save"
      @cancel="cancel"
    >
      <!-- It seems we can’t bind a function in an object like :editor="{ content, saveDraft }"  -->
      <!-- So we need an extra attribute to expose save function in parent -->
      <slot
        name="edition"
        :editor="{ content }"
        :save-draft="saveDraft"
      >
        <QInput
          v-model="content"
          :type="inputType"
          :label="inputLabel"
          :counter="inputCounter"
          :autogrow="hasTextarea"
          autofocus
          @keyup.enter.stop
        />
      </slot>
      <div class="row q-py-sm justify-center">
        <QBtn
          :rounded="style.roundedTheme"
          :disabled="!allowFalsySave && !content"
          color="primary"
          flat
          @click="popupSetContent"
        >
          <AppContent
            entry="prompt"
            field="save_button"
          />
        </QBtn>
        <QBtn
          :rounded="style.roundedTheme"
          color="negative"
          flat
          @click="popupCancelContent"
        >
          <AppContent
            entry="prompt"
            field="cancel_button"
          />
        </QBtn>
      </div>
    </QPopupEdit>
  </component>
</template>

<style lang="stylus" scoped>
$switchable-editor-helpers-opacity = 0.5

.switchable-editor-container
  position: relative

.switchable-editor-container.-active
  cursor: pointer
  &:focus, &:hover
    .switchable-editor-icon
      opacity: 1

.switchable-editor-icon
  left: 0
  top: 0
  transform: translate(- 0.75em, - 0.5em)

.switchable-editor-placeholder
  &:focus, &:hover
    opacity: 1

.switchable-editor-icon, .switchable-editor-placeholder
  opacity: $switchable-editor-helpers-opacity
  transition: opacity 300ms ease

.-DEV-ENV-DEBUG-STYLES
  opacity: 0.1
</style>

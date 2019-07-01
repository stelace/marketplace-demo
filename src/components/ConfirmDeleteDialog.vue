<script>
import { mapState } from 'vuex'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {}
  },
  computed: {
    ...mapState([
      'style',
    ]),
  },
  methods: {
    confirm () { this.$emit('confirm') },
    cancel () { this.$emit('cancel') },
  },
}
</script>

<template>
  <QDialog
    :value="opened"
    :maximized="$q.screen.lt.sm"
    persistent
    transition-show="slide-top"
    transition-hide="slide-bottom"
  >
    <QCard>
      <QCardSection class="text-center q-ma-md">
        <slot>
          <AppContent entry="prompt" field="confirm_delete" />
        </slot>
      </QCardSection>

      <QCardSection class="row justify-between">
        <slot name="action">
          <QBtn
            flat
            :rounded="style.roundedTheme"
            color="primary"
            @click="confirm"
          >
            <AppContent entry="prompt" field="confirm_button" />
          </QBtn>
          <QBtn
            flat
            :rounded="style.roundedTheme"
            color="negative"
            @click="cancel"
          >
            <AppContent entry="prompt" field="cancel_button" />
          </QBtn>
        </slot>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="stylus" scoped>

</style>

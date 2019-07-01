<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {}
  },
  computed: {
    opened () {
      return this.content.appUpdateAvailable
    },
    noCache () {
      return this.content.appUpdateNoCache
    },
    ...mapState([
      'content'
    ])
  },
  methods: {
    refresh () {
      window.location.reload(this.noCache)
    }
  }
}
</script>

<template>
  <QDialog
    ref="updateDialog"
    :value="opened"
    position="bottom"
    persistent
    seamless
  >
    <QCard
      :class="[
        $q.screen.gt.xs ? 'q-mb-lg' : '',
        'bg-primary text-white q-pb-md q-px-md'
      ]"
    >
      <AppContent
        tag="QCardSection"
        class="text-h6"
        entry="prompt"
        field="service_update.available"
      />

      <AppContent
        tag="QCardSection"
        class="text-body2"
        entry="prompt"
        field="service_update.refresh_helper"
      />

      <div class="row justify-end">
        <QBtn
          v-close-popup
          class="bg-white text-primary"
          :label="$t({ id: 'prompt.service_update.refresh_button' })"
          @click="refresh"
        />
      </div>
    </QCard>
  </QDialog>
</template>

<style lang="stylus" scoped>
</style>

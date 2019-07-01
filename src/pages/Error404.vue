<script>
import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      errorCode: 404
    }
  },
  beforeMount () {
    const urlCode = this.$route.path.replace(/[^\d]*(\d{3})$/, '$1')

    if (urlCode) {
      this.errorCode = parseInt(urlCode, 10) || this.errorCode
    }
  }
}
</script>

<template>
  <QPage class="flex flex-center">
    <div class="text-center">
      <AppContent
        class="text-h5 text-weight-medium"
        tag="h1"
        entry="pages"
        field="not_found.header"
      />

      <QBtn
        class="q-mb-xl"
        color="secondary"
        :to="{ name: 'home' }"
        :label="$t( { id: 'navigation.home' })"
      />

      <p
        v-if="errorCode === 404"
        class="text-grey"
      >
        {{ $t( { id: 'pages.not_found.404_error_label' }) }}
      </p>
      <p
        v-else
        class="text-grey"
      >
        <AppContent
          entry="pages"
          field="not_found.custom_error_code_label"
          :options="{ errorCode }"
        />
      </p>
    </div>
  </QPage>
</template>

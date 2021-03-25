<script>
import BasicHeroLayout from 'src/layouts/BasicHeroLayout'

import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  components: {
    BasicHeroLayout,
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {}
  },
  computed: {
    entry () {
      return this.$route.meta.contentEntry
    },
    entryPageName () {
      return this.$route.meta.contentPageName
    },
    headerField () { return `${this.entryPageName}.header` },
    subheaderField () { return `${this.entryPageName}.subheader` },
    contentField () { return `${this.entryPageName}.content` }
  }
}
</script>

<template>
  <!-- You may want to use <component :is="computedLayoutName"> to use dynamic layout -->
  <!--
    If this is confusing, have a look at:
    https://itnext.io/anyway-heres-how-to-create-a-multiple-layout-system-with-vue-and-vue-router-b379baa91a05
  -->
  <BasicHeroLayout class="stl-instant-page">
    <template #heroContent>
      <AppContent
        class="text-h3"
        tag="h1"
        :entry="entry"
        :field="headerField"
      />
      <AppContent
        class="text-h5 text-weight-medium"
        tag="h2"
        :entry="entry"
        :field="subheaderField"
      />
    </template>
    <section class="q-pt-lg text-body1">
      <AppContent
        class="stl-content-container stl-content-container--large text-justify preserve-lines margin-h-center q-pa-lg"
        tag="div"
        :entry="entry"
        :field="contentField"
      />
    </section>
    <AppFooter />
  </BasicHeroLayout>
</template>

<style lang="stylus">
.stl-instant-page .stl-content-container
  h2
    font-size: $h-tags[h4].size
    font-weight: $h-tags[h4].weight
    line-height: $h-tags[h4].line-height
    letter-spacing: $h-tags[h4].letter-spacing
  h3
    font-size: $h-tags[h5].size
    font-weight: $h-tags[h5].weight
    line-height: $h-tags[h5].line-height
    letter-spacing: $h-tags[h5].letter-spacing
  h4
    font-size: $h-tags[h6].size
    font-weight: $h-tags[h6].weight
    line-height: $h-tags[h6].line-height
    letter-spacing: $h-tags[h6].letter-spacing
  h5
    font-size: $h-tags[h6].size
    font-weight: $h-tags[h6].weight
    line-height: $h-tags[h6].line-height
    letter-spacing: $h-tags[h6].letter-spacing
</style>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    textColor: {
      type: String,
      default: 'primary' // white on home page, above hero
    }
  },
  computed: {
    isHome () {
      return this.route.name === 'home'
    },
    ...mapState([
      'content',
      'style',
      'route',
    ]),
  },
  methods: {
    switchLang () {
      this.$store.dispatch('fetchAppContent', { locale: this.content.locale === 'fr' ? 'en' : 'fr' })
    }
  }
}
</script>

<template>
  <QBtnDropdown
    class="q-px-xs"
    :label="content.locale"
    :rounded="style.roundedTheme"
    :text-color="isHome ? 'white' : textColor"
    color="transparent"
    unelevated
  >
    <QList>
      <QItem
        v-close-popup
        clickable
        @click="switchLang('en')"
      >
        <QItemSection :class="['text-center', content.locale === 'en' ? 'text-weight-bold' : '']">
          English
        </QItemSection>
      </QItem>
      <QItem
        v-close-popup
        class="text-center"
        clickable
        @click="switchLang('fr')"
      >
        <QItemSection :class="['text-center', content.locale === 'fr' ? 'text-weight-bold' : '']">
          Français
        </QItemSection>
      </QItem>
    </QList>
  </QBtnDropdown>
</template>

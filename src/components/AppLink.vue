<script>
import { get } from 'lodash'

export default {
  props: {
    to: {
      type: [String, Object],
      required: true,
      validator: function (v) {
        return typeof v === 'string' || !!get(v, 'name')
      }
    },
    tag: { // used for router-link component
      type: String,
      default: 'a'
    },
    isExternalRoute: { // forcing use of plain anchor instead of router-link
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      externalAppRoutes: [/* '/not-current-vue-app' */]
    }
  },
  computed: {
    linkProperties () {
      if (!this.to) return {}

      // We don’t want to use router-link when anchor points to website path
      // not served by current Quasar app like /docs
      const isStringTo = typeof this.to === 'string'
      const isExternalAppRoute = this.isExternalRoute ||
        (isStringTo && this.externalAppRoutes.some(r => this.to.startsWith(r)))

      if ((isStringTo && this.to.match(/^http(s)?:\/\//)) || isExternalAppRoute) {
        return {
          is: 'a',
          href: this.to,
          ...this.$attrs
        }
      }

      let routerLinkTo
      if (this.to.name) routerLinkTo = { name: this.to.name }
      if (isStringTo && this.to.match(/^\//)) routerLinkTo = this.to

      return {
        is: 'router-link',
        tag: this.tag,
        to: routerLinkTo || '',
        ...this.$attrs
      }
    },
  },
}
</script>

<template>
  <component
    :is="linkProperties.is"
    v-bind="linkProperties"
  >
    <slot />
  </component>
</template>

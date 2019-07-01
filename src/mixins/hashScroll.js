const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

export default {
  mounted () {
    this.scrollToAnchor()
  },
  watch: {
    $route () {
      this.scrollToAnchor()
    }
  },
  methods: {
    async scrollToAnchor () {
      // scroll to the anchor
      // https://github.com/vuejs/vue-router/issues/1668
      const currentRoute = this.$router.currentRoute
      const idToScrollTo = currentRoute.hash

      if (!idToScrollTo) return

      // add a little delay so the page has time to display HTML elements with correct size
      await delay(500)

      this.$nextTick(() => {
        if (document.querySelector(idToScrollTo)) {
          // smooth behavior isn't supported by all browsers though
          // https://caniuse.com/#feat=scrollintoview
          // if smooth scrolling is needed, the following polyfill can be added: https://github.com/iamdustan/smoothscroll
          document.querySelector(idToScrollTo).scrollIntoView({ behavior: 'smooth' })
        }
      })
    },
  }
}

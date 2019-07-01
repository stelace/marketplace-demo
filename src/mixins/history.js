export default {
  methods: {
    goToPreviousPage () {
      if (typeof window !== 'object') return

      // in Chrome, history length starts at 2 and if we go back, it will get out of the website
      // in Firefox, it is 1, going back won't get out of the website
      // redirect to home page if there is no history
      if (window.history.length > 2) {
        this.$router.go(-1)
      } else {
        this.$router.push({ name: 'home' })
      }
    },
  }
}

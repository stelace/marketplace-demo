export default {
  // this method won't be called in SSR context
  // authentication cannot be managed in server-side
  // because tokens are stored in local storage

  // redirect in client-side for private routes once we determinate
  // the current user isn't logged
  async mounted () {
    await this.$store.dispatch('fetchCurrentUser')

    const notAllowed = this.$route.meta.mustBeLogged && !this.$store.getters.currentUser.id

    if (notAllowed) {
      this.$router.push({ name: 'home', query: { redirect: this.$route.fullPath } })
    } else {
      if (typeof this.afterAuth === 'function') {
        this.afterAuth()
      }
    }
  }
}

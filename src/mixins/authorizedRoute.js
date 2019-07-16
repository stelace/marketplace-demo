import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([

    ])
  },

  methods: {
    checkAccessOrRedirect (action) {
      let haveAccess = false

      switch (action) {
        default:
          haveAccess = false
          break
      }

      if (!haveAccess) {
        this.notifyWarning('error.not_authorized_page')
        this.$router.push({ name: 'home' })
      }

      return haveAccess
    },
  }
}

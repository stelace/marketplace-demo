import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'canCreateAsset',
    ])
  },

  methods: {
    checkAccessOrRedirect (action) {
      let haveAccess = false

      switch (action) {
        case 'createAsset':
          haveAccess = this.canCreateAsset
          break

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
